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
import tw from "twrnc";
import { resetPassword } from "app/screens/Auth/action";
import { showMessage } from "react-native-flash-message";

// Reset Password validation schema
const ResetPasswordSchema = Yup.object().shape({
	resetCode: Yup.string().required("Vui lòng nhập thông tin"),
	password: Yup.string().required("Vui lòng nhập mật khẩu mới"),
	passwordAgain: Yup.string()
		.required("Vui lòng xác nhận lại mật khẩu mới")
		.oneOf([Yup.ref("password"), null], "Mật khẩu xác nhận không trùng khớp"),
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
				keyboardType={props.keyboardType || "default"}
			/>

			{hasError && (
				<Text style={styles.errorText}>{form.errors[field.name]}</Text>
			)}
		</View>
	);
};

const ResetPasswordScreen = ({ navigation, route }) => {
	const settings = useSelector(state => state.SettingsReducer.options);
	const dispatch = useDispatch();
	const email = route?.params?.email || "";
	const [resetError, setResetError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		// Hide header for cleaner look
		navigation.setOptions({
			headerShown: false,
		});
	}, [navigation]);

	// Handle reset password with better error handling
	const handleResetPassword = (values, { setSubmitting }) => {
		setResetError(false);
		setIsLoading(true);

		try {
			dispatch(
				resetPassword({
					email: email,
					resetCode: values.resetCode,
					password: values.password,
					passwordAgain: values.passwordAgain,
					navigation,
					onSuccess: () => {
						setIsLoading(false);
						setSubmitting(false);
					},
					onError: (error) => {
						setResetError(true);
						setIsLoading(false);
						setSubmitting(false);
						showMessage({
							message: error?.message || "Đặt lại mật khẩu thất bại, vui lòng thử lại",
							type: "danger",
							icon: "danger",
							duration: 3000,
						});
					}
				})
			);
		} catch (error) {
			setResetError(true);
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
				{/* App Logo and Header Text */}
				<View style={styles.headerContainer}>
					<View style={styles.logoContainer}>
						<Image
							source={{ uri: settings && settings.app_logo }}
							style={tw`h-20 w-20`}
							resizeMode="contain"
						/>
					</View>
					<Text style={styles.welcomeText}>Đặt mật khẩu mới</Text>
					<Text style={styles.subtitleText}>
						Nhập mã xác thực từ email và mật khẩu mới của bạn
					</Text>
				</View>

				{/* Reset Password Form */}
				<Formik
					initialValues={{
						resetCode: "",
						password: "",
						passwordAgain: "",
					}}
					validationSchema={ResetPasswordSchema}
					onSubmit={handleResetPassword}
				>
					{({ handleSubmit, isValid, isSubmitting }) => (
						<View style={styles.formContainer}>
							<Field
								component={ModernInput}
								name="resetCode"
								label="Mã xác thực từ Email"
								required
								keyboardType="numeric"
								placeholder="Nhập mã gồm 6 chữ số"
								autoFocus
							/>

							<Field
								component={ModernInput}
								name="password"
								label="Mật khẩu mới"
								secureTextEntry
								required
								placeholder="Nhập mật khẩu mới"
							/>

							<Field
								component={ModernInput}
								name="passwordAgain"
								label="Nhập lại mật khẩu mới"
								secureTextEntry
								required
								placeholder="Xác nhận mật khẩu mới"
							/>

							<TouchableOpacity
								style={[
									styles.submitButton,
									(!isValid && !resetError) && styles.disabledButton,
								]}
								onPress={handleSubmit}
								disabled={(!isValid && !resetError) || (isLoading && !resetError)}
							>
								{isLoading && !resetError ? (
									<View style={styles.loadingContainer}>
										<ActivityIndicator size="small" color="#fff" style={styles.loadingIndicator} />
										<Text style={styles.submitButtonText}>Đang xử lý...</Text>
									</View>
								) : (
									<Text style={styles.submitButtonText}>
										{resetError ? "Thử lại" : "Xác nhận"}
									</Text>
								)}
							</TouchableOpacity>

							<View style={styles.actionsContainer}>
								<TouchableOpacity
									style={styles.actionLink}
									onPress={() => navigation.navigate("Login")}
								>
									<Text style={styles.actionLinkText}>Quay lại đăng nhập</Text>
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
		marginBottom: 10,
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
	submitButton: {
		backgroundColor: "#2ea65d",
		borderRadius: 10,
		height: 56,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 10,
	},
	disabledButton: {
		backgroundColor: "#a5d8b9",
	},
	loadingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	loadingIndicator: {
		marginRight: 10,
	},
	submitButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "700",
		textTransform: "uppercase",
	},
	actionsContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 24,
	},
	actionLink: {
		paddingVertical: 8,
		paddingHorizontal: 12,
	},
	actionLinkText: {
		color: "#2ea65d",
		fontWeight: "600",
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

export default ResetPasswordScreen;
