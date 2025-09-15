import React, {useEffect, useState} from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import * as Yup from "yup";
import apiConfig from "app/config/api-config";
import {showMessage} from "react-native-flash-message";
import {Field, Formik} from "formik";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import CustomInput from "app/components/CustomInput";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import {useSelector} from "react-redux";
import {useWalletConnectModal} from "@walletconnect/modal-react-native";
import {ethers} from "ethers";
import { formatAddress } from "app/utils/helper.js";
import metamask from '../../assets/images/metamask.png'
import CurrencyInput from "react-native-currency-input";

function DepositScreen(props) {
  const currentUser = useSelector(state => state.memberAuth.user);
  const [paymentMethod, setPaymentMethod] = useState('BankTransfer');
  const [cashAmount, setCashAmount] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const settings = useSelector(state => state.SettingsReducer.options);

  let paymentMethods = [
    {
      id: 1,
      name: 'Chuyển khoản',
      code: 'BankTransfer'
    },
    {
      id: 2,
      name: 'SME Coin',
      code: 'SME'
    },
  ];

  if (props.backScreen === 'RewardWallet') {
    paymentMethods = [
      {
        id: 1,
        name: 'Chuyển khoản',
        code: 'BankTransfer'
      },
    ];
  }

  const {signer, open, isConnected, provider, address} =
      useWalletConnectModal();

  const connect = async () => {
    try {
      setConnecting(true);
      console.log('Starting connection process...');

      // Only try to disconnect if we have an active session
      if (provider && isConnected) {
        try {
          console.log('Disconnecting active session');
          await provider.disconnect();
          console.log('Disconnected existing session');
          // Wait for disconnect to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (disconnectError) {
          console.log('Disconnect error:', disconnectError);
          // Continue anyway even if disconnect fails
        }
      } else {
        console.log('No active session to disconnect');
      }

      console.log('Opening wallet selector...');

      // Directly open the wallet selector
      await open();

      console.log('Wallet selector opened');

      // Monitor connection status with longer timeout
      const connectionTimer = setTimeout(() => {
        if (!isConnected && connecting) {
          console.log('Connection timeout');
          setConnecting(false);
          showMessage({
            message: 'Kết nối ví MetaMask bị hết thời gian. Vui lòng thử lại.',
            type: 'warning',
            icon: 'warning',
            duration: 3000,
          });
        }
      }, 60000); // Increase timeout to 1 minute

      return () => clearTimeout(connectionTimer);
    } catch (e) {
      console.error('Connection error:', e);
      setConnecting(false);
      showMessage({
        message: 'Không thể kết nối ví: ' + (e.message || 'Lỗi không xác định'),
        type: 'danger',
        icon: 'danger',
        duration: 3000,
      });
    }
  };

  const disconnect = async () => {
    try {
      if (isConnected) {
        await provider?.disconnect();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add a separate effect to monitor connection changes with better debug info
  useEffect(() => {
    console.log('⭐️ Connection state changed:', isConnected ? 'CONNECTED' : 'DISCONNECTED');
    console.log('⭐️ Wallet address:', address || 'None');
    console.log('⭐️ Provider status:', provider ? 'Available' : 'Not available');

    if (isConnected) {
      setConnecting(false);
      showMessage({
        message: 'Ví MetaMask đã được kết nối!',
        type: 'success',
        icon: 'success',
        duration: 3000,
      });
    }
  }, [isConnected, address]);

  // Handle payment method changes
  useEffect(() => {
    console.log('Payment method changed to:', paymentMethod);
    if (paymentMethod === 'SME' && !isConnected) {
      console.log('SME payment method selected, not connected yet');
    }
  }, [paymentMethod, isConnected]);

  const sendToken = async (amountVND) => {
    const transferABI = [
      {
        name: 'transfer',
        type: 'function',
        inputs: [
          {
            name: '_to',
            type: 'address'
          },
          {
            type: 'uint256',
            name: '_tokens'
          },
        ],
        constant: false,
        outputs: [{
          name: 'success',
          type: 'bool'
        }],
        payable: false,
      },
    ];
    const tokenContract = settings && settings.SME_contract_address;
    const to = settings && settings.received_main_wallet;
    const amount = (Number(amountVND)/Number(settings && settings.coin_value)).toString();

    try {
      console.log('Số lượng token cần chuyển:', amount);

      const token = new ethers.Contract(tokenContract, transferABI, signer);
      const data = token.interface.encodeFunctionData('transfer', [
        to,
        ethers.utils.parseUnits(amount, 18),
      ]);

      // Use consistent chain ID format
      const chainId = '0x38'; // BSC Mainnet

      const transactionParameters = {
        from: address,
        to: tokenContract,
        data: data,
        chainId: chainId
      };

      setLoading(true);
      console.log('Đang gửi yêu cầu ký giao dịch...');

      // Add a timeout to provide fallback if MetaMask doesn't respond
      const txPromise = provider.request(
          {
            method: 'eth_sendTransaction',
            params: [transactionParameters],
          },
          'eip155:56'
      );

      // Set a timeout for the transaction
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Yêu cầu giao dịch đã hết thời gian')), 30000);
      });

      const txHash = await Promise.race([txPromise, timeoutPromise]);
      console.log('Giao dịch đã được gửi, hash:', txHash);

      setLoading(false);
      return txHash;
    } catch (e) {
      setLoading(false);
      console.error('Lỗi giao dịch:', e);

      // Xử lý thông báo lỗi người dùng thân thiện
      let errorMessage = 'Có lỗi xảy ra, vui lòng thử lại!';

      if (e.message) {
        if (e.message.includes('user rejected') || e.message.includes('User denied')) {
          errorMessage = 'Giao dịch đã bị từ chối.';
        } else if (e.message.includes('insufficient funds')) {
          errorMessage = 'Số dư không đủ để thực hiện giao dịch.';
        } else if (e.message.toLowerCase().includes('timeout')) {
          errorMessage = 'Yêu cầu giao dịch đã hết thời gian.';
        }
      }

      showMessage({
        message: errorMessage,
        type: 'danger',
        icon: 'danger',
        duration: 3000,
      });
    }
  };

  const InvestmentSchema = Yup.object().shape({});

  async function handleCreateInvest(values) {
    // Connection is already handled by the button's onPress function
    // This function should only handle the actual form submission logic

    if (!cashAmount || Number(cashAmount) <= 0) {
      showMessage({
        message: 'Vui lòng nhập số tiền!',
        type: 'danger',
        icon: 'danger',
        duration: 3000,
      });
      return;
    }

    // If using SME and not connected, this should never happen as the button handles it
    if (paymentMethod === 'SME' && !isConnected) {
      console.log('Not connected but trying to submit form. This should not happen.');
      return;
    }

    setDisabled(true);

    if (paymentMethod === 'BankTransfer') {
      // Bank transfer logic
      const token = await AsyncStorage.getItem('sme_user_token');
      axios
          .post(
              apiConfig.BASE_URL + '/member/transactions/deposit',
              {
                amount: cashAmount,
                wallet: props.wallet,
                paymentMethod,
              },
              {headers: {Authorization: `Bearer ${token}`}}
          )
          .then(response => {
            showMessage({
              message: 'Đã gửi yêu cầu nạp tiền, vui lòng thanh toán!',
              type: 'success',
              icon: 'success',
              duration: 3000,
            });
            props.navigation.navigate('TransactionDetail', {
              id: response.data.id,
            });
            setDisabled(false);
          })
          .catch(error => {
            showMessage({
              message: error.response.data.message,
              type: 'danger',
              icon: 'danger',
              duration: 3000,
            });
            setDisabled(false);
          });
    } else {
      // SME Coin payment logic - we know we're connected here
      try {
        console.log('Sending token transaction...');
        const txtHash = await sendToken(cashAmount);
        console.log('Transaction hash:', txtHash);

        if (txtHash) {
          const token = await AsyncStorage.getItem('sme_user_token');
          axios
              .post(
                  apiConfig.BASE_URL + '/member/transactions/deposit',
                  {
                    amount: cashAmount,
                    wallet: props.wallet,
                    paymentMethod,
                    hash: txtHash
                  },
                  {headers: {Authorization: `Bearer ${token}`}}
              )
              .then(response => {
                showMessage({
                  message: 'Đang xác nhận thanh toán, vui lòng chờ xác thực từ blockchain!',
                  type: 'success',
                  icon: 'success',
                  duration: 3000,
                });
                props.navigation.navigate('TransactionDetail', {
                  id: response.data.id,
                });
                setDisabled(false);
              })
              .catch(error => {
                showMessage({
                  message: error.response.data.message,
                  type: 'danger',
                  icon: 'danger',
                  duration: 3000,
                });
                setDisabled(false);
              });
        }
      } catch (error) {
        console.error('Transaction error:', error);
        showMessage({
          message: 'Có lỗi xảy ra khi gửi giao dịch, vui lòng thử lại sau!',
          type: 'danger',
          icon: 'danger',
          duration: 3000,
        });
        setDisabled(false);
      }
    }
  }

  if (currentUser) {
    var initialValues = {};
  }

  console.log(cashAmount);

  return (
      <View>
        <View
            style={tw`bg-white ios:pt-4 android:pt-4 pb-4 flex-row items-center`}
        >
          <TouchableOpacity
              onPress={() => props.navigation.navigate(props.backScreen)}
              style={tw`mr-3 ml-3`}
          >
            <Icon name="close" size={26} />
          </TouchableOpacity>
          <Text style={tw`font-medium uppercase`}>
            Nạp {props.currency} vào ví
          </Text>
        </View>
        <Formik
            initialValues={initialValues}
            onSubmit={values => handleCreateInvest(values)}
            validationSchema={InvestmentSchema}
        >
          {({handleSubmit, values, setFieldValue, isValid}) => (
              <KeyboardAwareScrollView keyboardShouldPersistTaps={'handled'}>
                <View style={tw`pb-32`}>
                  <View style={tw`px-3 py-5 my-3 bg-white`}>
                    {/*<Field
                  component={CustomInput}
                  required
                  name="amount"
                  label={`Số ${props.currency} cần nạp (VNĐ)`}
                  keyboardType={"numeric"}
                />*/}

                    <View style={tw`mb-5`}>
                      <Text style={tw`mb-1 font-medium text-gray-500`}>Số {props.currency} cần nạp</Text>
                      <CurrencyInput
                          value={cashAmount}
                          onChangeValue={setCashAmount}
                          delimiter=","
                          separator="."
                          precision={0}
                          minValue={0}
                          onChangeText={(formattedValue) => {
                            console.log(formattedValue); // R$ +2.310,46
                          }}
                          style={tw`border border-gray-300 p-3 rounded text-base`}
                      />
                    </View>

                    <View style={tw`mb-5`}>
                      <Text style={tw`mb-1 font-medium text-gray-500`}>
                        Chọn nguồn nạp
                      </Text>
                      <View style={tw`flex items-center flex-row`}>
                        {paymentMethods.map(el => (
                            <View style={tw`mr-3 relative`} key={el.id}>
                              <TouchableOpacity
                                  onPress={() => setPaymentMethod(el.code)}
                                  style={tw`px-3 py-2 rounded-md ${
                                      el.code === paymentMethod
                                          ? 'bg-red-500'
                                          : 'bg-gray-200'
                                  }`}
                              >
                                <Text
                                    style={tw`${
                                        el.code === paymentMethod
                                            ? 'text-white'
                                            : 'text-gray-700'
                                    }`}
                                >
                                  {el.name}
                                </Text>
                              </TouchableOpacity>
                              {el.code === paymentMethod && (
                                  <Icon
                                      name={'check-circle'}
                                      size={20}
                                      style={tw`absolute -top-1 -right-1 text-red-200`}
                                  />
                              )}
                            </View>
                        ))}
                      </View>
                    </View>

                    {(loading || connecting) && (
                        <View style={tw`p-2 mb-3 bg-yellow-50 rounded`}>
                          <Text style={tw`text-yellow-800`}>
                            {connecting ? 'Đang kết nối ví MetaMask...' : 'Đang xử lý giao dịch...'}
                          </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        key={`connect-button-${isConnected ? 'connected' : 'disconnected'}-${connecting ? 'connecting' : 'idle'}`}
                        disabled={disabled || loading || connecting}
                        style={tw`bg-green-600 px-5 py-4 mt-3 rounded w-full flex items-center justify-between ${(disabled || loading || connecting) ? 'opacity-70' : ''}`}
                        onPress={async () => {
                          console.log('Button pressed, isConnected:', isConnected);
                          console.log('Payment method:', paymentMethod);

                          if (paymentMethod === 'SME' && !isConnected) {
                            console.log('Initiating wallet connection');
                            await connect();
                          } else {
                            console.log('Submitting form');
                            handleSubmit();
                          }
                        }}
                    >
                      <Text style={tw`text-white font-bold uppercase`}>
                        {paymentMethod === 'SME' && !isConnected
                            ? (connecting ? 'Đang kết nối...' : 'Kết nối')
                            : 'Xác nhận'}
                      </Text>
                    </TouchableOpacity>
                    {paymentMethod === 'SME' && isConnected && (
                        <View
                            style={tw`flex items-center justify-between mt-5 flex-row bg-gray-700 p-2 rounded`}
                        >
                          <View style={tw`flex items-center flex-row`}>
                            <Icon name="wallet"
                                  size={24}
                                  style={tw`text-white mr-3`}
                            />
                            <View>
                              <Text style={tw`text-gray-400`}>Đã kết nối</Text>
                              <Text style={tw`text-white font-medium text-base`}>{formatAddress(address)}</Text>
                            </View>
                          </View>

                          <TouchableOpacity
                              style={tw`bg-red-500 rounded flex items-center justify-between p-2`}
                              onPress={disconnect}
                          >
                            <Text style={tw`text-white font-bold uppercase`}>
                              Ngắt kết nối
                            </Text>
                          </TouchableOpacity>
                        </View>
                    )}
                  </View>
                </View>
              </KeyboardAwareScrollView>
          )}
        </Formik>
      </View>
  );
}

export default DepositScreen;
