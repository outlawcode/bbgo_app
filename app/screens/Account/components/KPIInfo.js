import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiConfig from 'app/config/api-config';
import { formatVND } from 'app/utils/helper';

function KPIInfo() {
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKPI();
  }, []);

  const fetchKPI = async () => {
    try {
      const token = await AsyncStorage.getItem('sme_user_token');
      const response = await axios.get(`${apiConfig.BASE_URL}/member/kpi/realtime`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKpiData(response.data);
    } catch (error) {
      console.error('Error fetching KPI:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={tw`bg-white rounded-xl p-4 mb-3 border border-gray-100`}>
        <ActivityIndicator size="small" color="#008A97" />
      </View>
    );
  }

  if (!kpiData || !kpiData.eligible) {
    return null;
  }

  const { kpiData: data, maintainKPI, maintainStatus, maintainMissing, upgradeKPI, upgradeStatus, upgradeMissing, nextPosition, monthsNeeded, messages, checkMonths } = kpiData;

  const calculateProgress = (current, total) => {
    if (total === 0) return 0;
    return Math.min(100, (current / total) * 100);
  };

  return (
    <View style={tw`mb-3 bg-white rounded-xl border border-gray-100 shadow-sm`}>
      {/* Header */}
      <View style={tw`px-4 py-3 border-b border-gray-100`}>
        <Text style={tw`font-bold text-gray-800 text-base`}>Thông tin KPI</Text>
      </View>

      <View style={tw`px-4 py-3`}>
        {/* KPI hiện tại */}
        <View style={tw`mb-4`}>
          <View style={tw`flex flex-row justify-between items-center mb-1`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm text-gray-600`}>
                KPI hiện tại ({checkMonths} tháng)
                {kpiData.currentMonths && kpiData.currentMonths.length > 0 && (
                  <Text style={tw`text-xs text-gray-500`}>
                    {'\n'}({kpiData.currentMonths.join(' + ')})
                  </Text>
                )}
              </Text>
            </View>
            <Text style={[tw`font-bold text-base`, data.totalKPISales >= (maintainKPI || upgradeKPI) ? tw`text-green-600` : tw`text-red-600`]}>
              {formatVND(data.totalKPISales)}
            </Text>
          </View>
          <Text style={tw`text-xs text-gray-500`}>
            Cá nhân: {formatVND(data.personalSales)} | F1: {formatVND(data.f1Sales)} | F2: {formatVND(data.f2Sales)}
          </Text>
        </View>

        {/* KPI duy trì */}
        {maintainKPI > 0 && (
          <View style={tw`mb-4`}>
            <View style={tw`flex flex-row justify-between items-center mb-1`}>
              <Text style={tw`text-sm text-gray-600`}>KPI duy trì:</Text>
              <Text style={[tw`font-medium text-base`, maintainStatus ? tw`text-green-600` : tw`text-red-600`]}>
                {formatVND(maintainKPI)}
              </Text>
            </View>
            {!maintainStatus && maintainMissing > 0 && (
              <View style={tw`mt-2`}>
                <View style={tw`h-2 bg-gray-200 rounded-full overflow-hidden`}>
                  <View 
                    style={[
                      tw`h-full bg-red-500 rounded-full`,
                      { width: `${calculateProgress(data.totalKPISales, maintainKPI)}%` }
                    ]}
                  />
                </View>
                <Text style={tw`text-xs text-red-600 text-right mt-1`}>
                  Còn thiếu {formatVND(maintainMissing)}
                </Text>
              </View>
            )}
            {maintainStatus && (
              <View style={tw`flex flex-row items-center mt-1`}>
                <Icon name="check-circle" size={14} style={tw`text-green-600 mr-1`} />
                <Text style={tw`text-xs text-green-600`}>Đã đạt KPI duy trì</Text>
              </View>
            )}
          </View>
        )}

        {/* KPI lên cấp */}
        {nextPosition && upgradeKPI > 0 && (
          <View style={tw`mb-4`}>
            <View style={tw`flex flex-row justify-between items-center mb-1`}>
              <Text style={tw`text-sm text-gray-600`}>KPI lên cấp {nextPosition}:</Text>
              <Text style={[tw`font-medium text-base`, upgradeStatus ? tw`text-green-600` : tw`text-red-600`]}>
                {formatVND(upgradeKPI)}
              </Text>
            </View>
            {!upgradeStatus && upgradeMissing > 0 && (
              <View style={tw`mt-2`}>
                <View style={tw`h-2 bg-gray-200 rounded-full overflow-hidden`}>
                  <View 
                    style={[
                      tw`h-full bg-blue-500 rounded-full`,
                      { width: `${calculateProgress(data.totalKPISales, upgradeKPI)}%` }
                    ]}
                  />
                </View>
                <Text style={tw`text-xs text-red-600 text-right mt-1`}>
                  Còn thiếu {formatVND(upgradeMissing)}
                </Text>
              </View>
            )}
            {upgradeStatus && (
              <View style={tw`flex flex-row items-center mt-1`}>
                <Icon name="check-circle" size={14} style={tw`text-green-600 mr-1`} />
                <Text style={tw`text-xs text-green-600`}>Đã đủ điều kiện lên cấp {nextPosition}!</Text>
              </View>
            )}
          </View>
        )}

        {/* Thông báo */}
        {messages && messages.length > 0 && (
          <View style={tw`mt-2`}>
            {messages.map((msg, index) => {
              const isSuccess = msg.includes('đủ điều kiện') || msg.includes('đạt KPI') || msg.includes('Chúc mừng') || msg.includes('thăng cấp');
              const isWarning = msg.includes('thiếu') || msg.includes('cần thêm');
              
              let bgColor = 'bg-blue-50';
              let borderColor = 'border-blue-300';
              let textColor = 'text-blue-800';
              let iconColor = 'text-blue-600';
              let iconName = 'information';

              if (isSuccess) {
                bgColor = 'bg-green-50';
                borderColor = 'border-green-300';
                textColor = 'text-green-800';
                iconColor = 'text-green-600';
                iconName = 'check-circle';
              } else if (isWarning) {
                bgColor = 'bg-yellow-50';
                borderColor = 'border-yellow-300';
                textColor = 'text-yellow-800';
                iconColor = 'text-yellow-600';
                iconName = 'alert';
              }

              return (
                <View 
                  key={index} 
                  style={tw`${bgColor} ${borderColor} border rounded-lg p-3 mb-2`}
                >
                  <View style={tw`flex flex-row items-start`}>
                    <Icon name={iconName} size={16} style={tw`${iconColor} mr-2 mt-0.5`} />
                    <Text style={tw`${textColor} text-xs flex-1`}>{msg}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

export default KPIInfo;

