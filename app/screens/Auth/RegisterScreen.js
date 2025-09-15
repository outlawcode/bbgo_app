import React, { useEffect, useState, useRef } from "react";
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
import tw from "twrnc";
import { memberRegister } from "app/screens/Auth/action";
import { showMessage } from "react-native-flash-message";

// Register validation schema
const RegisterSchema = Yup.object().shape({
	name: Yup.string().required("Vui lòng nhập thông tin"),
	email: Yup.string()
		.email("Nhập đúng địa chỉ email")
		.required("Vui lòng nhập email"),
	phone: Yup.string()
		.max(10, ({ max }) => "Vui lòng nhập đúng số điện thoại")
		.min(10, ({ min }) => "Vui lòng nhập đúng số điện thoại")
		.required("Vui lòng nhập số điện thoại"),
	password: Yup.string().required("Vui lòng nhập mật khẩu"),
});

// Custom Input Component for better visual styling
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
				keyboardType={props.number ? "phone-pad" : props.keyboardType || "default"}
			/>

			{hasError && (
				<Text style={styles.errorText}>{form.errors[field.name]}</Text>
			)}
		</View>
	);
};

const RegisterScreen = ({ navigation, route }) => {
	const currentUser = useSelector((state) => state.memberAuth.user);
	const settings = useSelector(state => state.SettingsReducer.options);
	const dispatch = useDispatch();
	const recaptcha = useRef();
	const [registerError, setRegisterError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [forceUpdate, setForceUpdate] = useState(0);

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

	// Handle register with better error handling
	const handleRegister = (values, { setSubmitting }) => {
		setRegisterError(false);
		setIsLoading(true);

		try {
			dispatch(
				memberRegister({
					...values,
					navigation, // Thêm navigation prop
					onSuccess: () => {
						console.log("Register success - onSuccess called");
						setIsLoading(false);
						setSubmitting(false);
						// Hiển thị thông báo thành công
						showMessage({
							message: "Đăng ký thành công! Vui lòng đăng nhập.",
							type: "success",
							icon: "success",
							duration: 2000,
						});
						// Chuyển về trang đăng nhập với thông tin đã điền
						console.log("Navigating to Login with:", {
							values: {
								email: values.email,
								password: values.password
							}
						});
						// Thử navigation ngay lập tức
						try {
							navigation.navigate("Login", {
								values: {
									email: values.email,
									password: values.password
								}
							});
							console.log("Navigation completed");
						} catch (error) {
							console.error("Navigation error:", error);
						}
					},
					onError: (error) => {
						console.log("Register error - onError called", error);
						console.log("Setting registerError to true");

						// Đảm bảo setState được gọi đồng bộ
						setRegisterError(true);
						setIsLoading(false);
						setSubmitting(false);
						setForceUpdate(prev => prev + 1); // Force re-render

						console.log("showMessage error", error?.message);
						showMessage({
							message: error?.message || "Đăng ký thất bại, vui lòng thử lại",
							type: "danger",
							icon: "danger",
							duration: 3000,
						});

						// Force re-render
						setTimeout(() => {
							console.log("registerError after setState:", registerError);
						}, 100);
					}
				})
			);
		} catch (error) {
			console.log("Catch block called", error);
			setRegisterError(true);
			setIsLoading(false);
			setSubmitting(false);
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
						{/* Use the app logo from settings */}
						<Image
							source={{ uri: settings && settings.app_logo }}
							style={tw`h-20 w-20`}
							resizeMode="contain"
						/>
					</View>
					<Text style={styles.welcomeText}>Tạo tài khoản mới</Text>
					<Text style={styles.subtitleText}>
						Đăng ký để bắt đầu trải nghiệm ứng dụng
					</Text>
				</View>

				{/* Register Form */}
				<Formik
					initialValues={{
						name: "",
						email: "",
						phone: "",
						password: "",
						refId: "",
					}}
					validationSchema={RegisterSchema}
					onSubmit={handleRegister}
					validateOnBlur={false}
				>
					{({ handleSubmit, isValid, isSubmitting }) => (
						<View style={styles.formContainer}>
							<Field
								component={ModernInput}
								name="name"
								label="Họ và tên"
								required
								placeholder="Nhập họ và tên"
							/>

							<Field
								component={ModernInput}
								name="email"
								label="Địa chỉ Email"
								keyboardType="email-address"
								autoCapitalize="none"
								required
								placeholder="Nhập địa chỉ email"
							/>

							<Field
								component={ModernInput}
								name="phone"
								label="Số điện thoại"
								number
								required
								placeholder="Nhập số điện thoại"
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

							<Field
								component={ModernInput}
								name="refId"
								label="Mã giới thiệu"
								number
								placeholder="Nhập mã giới thiệu (nếu có)"
							/>

							<TouchableOpacity
								style={[
									styles.registerButton,
									(!isValid && !registerError) && styles.disabledButton,
								]}
								onPress={handleSubmit}
								// QUAN TRỌNG: Chỉ disable nút khi form không hợp lệ VÀ không có lỗi
								// Nếu có lỗi, vẫn cho phép nhấn lại ngay cả khi form invalid
								// CHỈ disable khi đang load VÀ không có lỗi
								disabled={(!isValid && !registerError) || isLoading}
							>
								{/* SỬA LỖI: isLoading chỉ hiển thị khi KHÔNG có lỗi */}
								{console.log("Render button - registerError:", registerError, "isLoading:", isLoading, "isValid:", isValid)}
								{isLoading && !registerError ? (
									<View style={styles.loadingContainer}>
										<ActivityIndicator size="small" color="#fff" style={styles.loadingIndicator} />
										<Text style={styles.registerButtonText}>Đang xử lý...</Text>
									</View>
								) : (
									<Text style={styles.registerButtonText}>
										{registerError ? "Thử lại" : "Tạo tài khoản"}
									</Text>
								)}
							</TouchableOpacity>

							<View style={styles.loginContainer}>
								<Text style={styles.loginText}>Đã có tài khoản? </Text>
								<TouchableOpacity
									onPress={() => navigation.navigate("Login")}
								>
									<Text style={styles.loginLink}>Đăng nhập</Text>
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
		marginBottom: 24,
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
		marginBottom: 16,
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
	registerButton: {
		backgroundColor: "#f97316", // Orange color to match original
		borderRadius: 10,
		height: 56,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 8,
	},
	disabledButton: {
		backgroundColor: "#f9a369", // Lighter orange for disabled state
	},
	loadingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	loadingIndicator: {
		marginRight: 10,
	},
	registerButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "700",
		textTransform: "uppercase",
	},
	loginContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 24,
	},
	loginText: {
		color: "#666",
		fontSize: 14,
	},
	loginLink: {
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

export default RegisterScreen;
