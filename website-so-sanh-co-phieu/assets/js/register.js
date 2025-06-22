;(function ($) {
	'use strict';
	const getRandom4DigitsFullRange = () => {
		const num = Math.floor(Math.random() * 10000); // 0 - 9999
		return num.toString().padStart(4, '0');
	}

	const handleFormRegister = function () {
		const frmRegister = $("#frmRegister");
		if (frmRegister.length === 0) return false;

		frmRegister.submit(function (event) {
			let elmButton = frmRegister.find('button[type=submit]'),
				elmButtonHTML = elmButton.html();

			elmButton.html('Vui lòng đợi...').prop('disabled', true);
			if (!frmRegister[0].checkValidity()) {
				event.preventDefault();
				event.stopPropagation();
				frmRegister.addClass('was-validated');
				elmButton.html(elmButtonHTML).prop('disabled', false);
			} else {
				const objDataSend = {};
				frmRegister.find('.inputData').each(function () {
					const nameInput = $(this).attr('name');
					const valueInput = $(this).val();
					objDataSend[nameInput] = valueInput;
				});

				const dataSend = {
					accountCode: "VIP" + getRandom4DigitsFullRange(),
					accountType: 1,
					avatar: "",
					...objDataSend
				};

				fetch('http://20.89.170.203:8000/register', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(dataSend),
				})
					.then(response => response.json())
					.then(data => {
						const statusCode = parseInt(data['status_code']);

						const statusHandlers = {
							200: () => {
								Toast.fire({icon: "success", title: "Đăng ký thành công"});
								setTimeout(() => location.href = './sign-in.html', 3000);
							},
							400: () => {
								Toast.fire({icon: "error", title: "Số điện thoại đã được đăng ký, vui lòng thử lại."});
								$('#phone').focus();
							},
							500: () => {
								Toast.fire({icon: "error", title: "Email đăng nhập đã đăng ký, vui lòng thử lại."});
								$('#email').focus();
							}
						};

						if (statusHandlers[statusCode]) {
							statusHandlers[statusCode]();
						} else {
							Toast.fire({
								icon: "error",
								title: "Có lỗi khi đăng ký, vui lòng thử lại."
							});
						}
					})
					.catch(error => {
						Toast.fire({
							icon: "error",
							title: "Có lỗi khi đăng ký, vui lòng thử lại."
						});
						setTimeout(() => window.location.reload(), 3000);
					});
			}

			return false;
		});
	}

	$(document).ready(function () {
		handleRedirectIsLogin();
		handleFormRegister();
	});
})
(jQuery);