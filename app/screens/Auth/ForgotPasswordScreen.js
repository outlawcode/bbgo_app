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
import { forgotPassword } from "app/screens/Auth/action";
import { showMessage } from "react-native-flash-message";

// Forgot Password validation schema
const ForgotPasswordSchema = Yup.object().shape({
	email: Yup.string()
		.email("Nhập đúng địa chỉ email")
		.required("Vui lòng nhập email"),
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

const ForgotPasswordScreen = ({ navigation }) => {
	const currentUser = useSelector((state) => state.memberAuth.user);
	const settings = useSelector(state => state.SettingsReducer.options);
	const dispatch = useDispatch();
	const [forgotError, setForgotError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

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

	// Handle forgot password with better error handling
	const handleForgotPassword = (values, { setSubmitting }) => {
		setForgotError(false);
		setIsLoading(true);

		try {
			dispatch(
				forgotPassword({
					email: values.email,
					navigation,
					onSuccess: () => {
						setIsLoading(false);
						setSubmitting(false);
					},
					onError: (error) => {
						setForgotError(true);
						setIsLoading(false);
						setSubmitting(false);
						showMessage({
							message: error?.message || "Yêu cầu thất bại, vui lòng thử lại",
							type: "danger",
							icon: "danger",
							duration: 3000,
						});
					}
				})
			);
		} catch (error) {
			setForgotError(true);
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
						<Image
							source={{ uri: settings && settings.website_logo }}
							style={tw`h-20 w-20`}
							resizeMode="contain"
						/>
					</View>
					<Text style={styles.welcomeText}>Quên mật khẩu?</Text>
					<Text style={styles.subtitleText}>
						Nhập địa chỉ email đã dùng để tạo tài khoản
					</Text>
				</View>

				{/* Forgot Password Form */}
				<Formik
					initialValues={{
						email: "",
					}}
					validationSchema={ForgotPasswordSchema}
					onSubmit={handleForgotPassword}
				>
					{({ handleSubmit, isValid, isSubmitting }) => (
						<View style={styles.formContainer}>
							<Field
								component={ModernInput}
								name="email"
								label="Email"
								keyboardType="email-address"
								autoCapitalize="none"
								required
								placeholder="Nhập địa chỉ email của bạn"
								autoFocus
							/>
							<TouchableOpacity
								style={[
									styles.submitButton,
									(!isValid && !forgotError) && styles.disabledButton,
								]}
								onPress={handleSubmit}
								disabled={(!isValid && !forgotError) || (isLoading && !forgotError)}
							>
								{isLoading && !forgotError ? (
									<View style={styles.loadingContainer}>
										<ActivityIndicator size="small" color="#fff" style={styles.loadingIndicator} />
										<Text style={styles.submitButtonText}>Đang xử lý...</Text>
									</View>
								) : (
									<Text style={styles.submitButtonText}>
										{forgotError ? "Thử lại" : "Tiếp tục"}
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
		borderColor: "#008A97",
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
		backgroundColor: "#e53e3e", // Red color from the original
		borderRadius: 10,
		height: 56,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 10,
	},
	disabledButton: {
		backgroundColor: "#e53e3e80", // Semi-transparent red
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
		color: "#008A97",
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

export default ForgotPasswordScreen;
