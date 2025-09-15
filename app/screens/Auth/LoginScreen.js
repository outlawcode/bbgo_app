import React, { useEffect, useState } from "react";
import {
	Text,
	TouchableOpacity,
	View,
	StyleSheet,
	Image,
	StatusBar,
	KeyboardAvoidingView,
	Platform,
	TextInput,
	ActivityIndicator
} from "react-native";
import { Field, Formik } from "formik";
import * as Yup from "yup";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";
import { memberLogin } from "app/screens/Auth/action";
import tw from "twrnc";
import { showMessage } from "react-native-flash-message";

// Login validation schema
const LoginSchema = Yup.object().shape({
	username: Yup.string().required("Vui lòng nhập thông tin"),
	password: Yup.string().required("Vui lòng nhập mật khẩu"),
});

// Custom Input Component
const ModernInput = ({ field, form, ...props }) => {
	const [isFocused, setIsFocused] = useState(false);
	const hasError = form.touched[field.name] && form.errors[field.name];

	return (
		<View style={styles.inputContainer}>
			<Text style={styles.inputLabel}>
				{props.label} {props.required && <Text style={{ color: "#e74c3c" }}>*</Text>}
			</Text>

			<TextInput
				{...props}
				style={[
					styles.textInput,
					isFocused && styles.focusedInput,
					hasError && styles.errorInput,
				]}
				value={field.value}
				onChangeText={form.handleChange(field.name)}
				onBlur={() => {
					setIsFocused(false);
					form.handleBlur(field.name);
				}}
				onFocus={() => setIsFocused(true)}
				placeholder={props.placeholder || props.label}
			/>

			{hasError && (
				<Text style={styles.errorText}>{form.errors[field.name]}</Text>
			)}
		</View>
	);
};

const LoginScreen = ({ navigation, route }) => {
	const currentUser = useSelector((state) => state.memberAuth.user);
	const settings = useSelector(state => state.SettingsReducer.options);
	const dispatch = useDispatch();
	const [loginError, setLoginError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Extract parameters from route
	const backScreen = route?.params?.backScreen;
	const initialEmail = route?.params?.values?.email || "";
	const initialPassword = route?.params?.values?.password || "";

	// Redirect if user is already logged in
	if (currentUser) {
		navigation.navigate("Account");
	}

	useEffect(() => {
		// Hide header for cleaner look
		navigation.setOptions({
			headerShown: false,
		});
	}, [navigation]);

	// Handle login submission with better error handling
	const handleLogin = (values, { setSubmitting }) => {
		setLoginError(false);
		setIsLoading(true);

		// Wrap the dispatch in a try-catch to handle errors
		try {
			dispatch(
				memberLogin({
					...values,
					navigation,
					backScreen: backScreen ? backScreen : "Account",
					onError: (error) => {
						setLoginError(true);
						setSubmitting(false);
						setIsLoading(false);
						showMessage({
							message: error?.message || "Đăng nhập thất bại, vui lòng thử lại",
							type: "danger",
							icon: "danger",
							duration: 3000,
						});
					}
				})
			);
		} catch (error) {
			setLoginError(true);
			setSubmitting(false);
			setIsLoading(false);
			showMessage({
				message: "Đã xảy ra lỗi, vui lòng thử lại",
				type: "danger",
				icon: "danger",
				duration: 3000,
			});
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.container}
		>
			<StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

			<KeyboardAwareScrollView
				contentContainerStyle={styles.scrollViewContent}
				keyboardShouldPersistTaps="handled"
			>
				{/* App Logo and Welcome Text */}
				<View style={styles.headerContainer}>
					<View style={styles.logoContainer}>
						<Image
							source={{uri: settings && settings.app_logo}}
							style={tw`h-20 w-20`}
							resizeMode="contain"
						/>
					</View>
					<Text style={styles.welcomeText}>Chào mừng trở lại!</Text>
					<Text style={styles.subtitleText}>
						Đăng nhập để tiếp tục sử dụng ứng dụng
					</Text>
				</View>

				{/* Login Form */}
				<Formik
					initialValues={{
						username: initialEmail,
						password: initialPassword,
					}}
					validationSchema={LoginSchema}
					onSubmit={handleLogin}
				>
					{({ handleSubmit, isValid, isSubmitting }) => (
						<View style={styles.formContainer}>
							<Field
								component={ModernInput}
								name="username"
								label="Email hoặc Số điện thoại"
								keyboardType="email-address"
								autoCapitalize="none"
								required
								placeholder="Nhập email hoặc số điện thoại"
							/>

							<Field
								component={ModernInput}
								name="password"
								label="Mật khẩu"
								secureTextEntry
								autoCapitalize="none"
								required
								placeholder="Nhập mật khẩu"
							/>

							<View style={styles.forgotPasswordContainer}>
								<TouchableOpacity
									onPress={() => navigation.navigate("ForgotPassword")}
								>
									<Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
								</TouchableOpacity>
							</View>

							<TouchableOpacity
								style={[
									styles.loginButton,
									(!isValid && !loginError) && styles.disabledButton,
								]}
								onPress={handleSubmit}
								// Quan trọng: Chỉ disable nút khi form không hợp lệ VÀ không có lỗi
								// Nếu có lỗi, vẫn cho phép nhấn lại ngay cả khi form invalid
								disabled={(!isValid && !loginError) || (isLoading && !loginError)}
							>
								{/* Sửa lỗi hiển thị: isLoading chỉ hiển thị khi KHÔNG có lỗi */}
								{isLoading && !loginError ? (
									<View style={styles.loadingContainer}>
										<ActivityIndicator size="small" color="#fff" style={styles.loadingIndicator} />
										<Text style={styles.loginButtonText}>Đang xử lý...</Text>
									</View>
								) : (
									<Text style={styles.loginButtonText}>
										{loginError ? "Thử lại" : "Đăng nhập"}
									</Text>
								)}
							</TouchableOpacity>

							<View style={styles.dividerContainer}>
								<View style={styles.divider} />
								<Text style={styles.dividerText}>hoặc</Text>
								<View style={styles.divider} />
							</View>

							{/* Social Login Buttons would go here */}

							<View style={styles.registerContainer}>
								<Text style={styles.registerText}>Chưa có tài khoản? </Text>
								<TouchableOpacity
									onPress={() => navigation.navigate("Register")}
								>
									<Text style={styles.registerLink}>Đăng ký ngay</Text>
								</TouchableOpacity>
							</View>
						</View>
					)}
				</Formik>
			</KeyboardAwareScrollView>

			{/* Back button */}
			<TouchableOpacity
				style={styles.backButton}
				onPress={() => navigation.goBack()}
			>
				<Text style={styles.backButtonText}>←</Text>
			</TouchableOpacity>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#ffffff",
	},
	scrollViewContent: {
		flexGrow: 1,
		paddingHorizontal: 24,
		paddingTop: Platform.OS === "ios" ? 60 : 40,
		paddingBottom: 24,
	},
	headerContainer: {
		alignItems: "center",
		marginBottom: 30,
	},
	logoContainer: {
		marginBottom: 20,
	},
	welcomeText: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 8,
	},
	subtitleText: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
	},
	formContainer: {
		width: "100%",
	},
	inputContainer: {
		marginBottom: 20,
		position: "relative",
	},
	inputLabel: {
		fontSize: 16,
		fontWeight: "500",
		color: "#333",
		marginBottom: 8,
		marginLeft: 4,
	},
	textInput: {
		height: 56,
		fontSize: 16,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 10,
		paddingHorizontal: 16,
		paddingVertical: 12,
		color: "#333",
		backgroundColor: "#f7f9fc",
	},
	focusedInput: {
		borderColor: "#2ea65d",
		borderWidth: 2,
		backgroundColor: "#fff",
	},
	errorInput: {
		borderColor: "#e74c3c",
	},
	errorText: {
		color: "#e74c3c",
		fontSize: 12,
		marginTop: 4,
		marginLeft: 4,
	},
	forgotPasswordContainer: {
		alignItems: "flex-end",
		marginBottom: 24,
	},
	forgotPasswordText: {
		color: "#2ea65d",
		fontWeight: "600",
	},
	loginButton: {
		backgroundColor: "#2ea65d",
		borderRadius: 10,
		height: 56,
		justifyContent: "center",
		alignItems: "center",
	},
	disabledButton: {
		backgroundColor: "#a5d8b9",
	},
	errorButton: {
		backgroundColor: "#2ea65d", // Giữ màu giống với nút đăng nhập bình thường
	},
	loadingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	loadingIndicator: {
		marginRight: 10,
	},
	loginButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "700",
	},
	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 24,
	},
	divider: {
		flex: 1,
		height: 1,
		backgroundColor: "#eee",
	},
	dividerText: {
		paddingHorizontal: 10,
		color: "#999",
		fontSize: 14,
	},
	registerContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 16,
	},
	registerText: {
		color: "#666",
		fontSize: 14,
	},
	registerLink: {
		color: "#2ea65d",
		fontWeight: "700",
		fontSize: 14,
	},
	backButton: {
		position: "absolute",
		top: Platform.OS === "ios" ? 50 : 30,
		left: 20,
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: "rgba(0,0,0,0.05)",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 10,
	},
	backButtonText: {
		fontSize: 18,
		color: "#333",
	},
});

export default LoginScreen;
