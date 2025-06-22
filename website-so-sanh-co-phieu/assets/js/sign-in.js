;(function ($) {
	'use strict';
	const handleFormSignIn = function () {
		const frmSignIn = $("#frmSignIn");
		if (frmSignIn.length === 0) return false;

		frmSignIn.submit(function (event) {
			let elmButton = frmSignIn.find('button[type=submit]'),
				elmButtonHTML = elmButton.html();

			elmButton.html('Vui lòng đợi...').prop('disabled', true);
			if (!frmSignIn[0].checkValidity()) {
				event.preventDefault();
				event.stopPropagation();
				frmSignIn.addClass('was-validated');
				elmButton.html(elmButtonHTML).prop('disabled', false);
			} else {
				const dataSend = new URLSearchParams();

				frmSignIn.find('.inputData').each(function () {
					const nameInput = $(this).attr('name');
					const valueInput = $(this).val();
					dataSend.append(nameInput, valueInput);
				});


				fetch('http://20.89.170.203:8000/login', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: dataSend.toString()
				})
					.then(response => response.json())
					.then(data => {
						const statusCode = parseInt(data['status_code']);

						const statusHandlers = {
							200: () => {
								localStorage.setItem('login', data['access_token']);

								Toast.fire({icon: "success", title: "Đăng nhập thành công"});
								setTimeout(() => location.href = './', 3000);
							},
						};

						if (statusHandlers[statusCode]) {
							statusHandlers[statusCode]();
						} else {
							Toast.fire({
								icon: "error",
								title: "Thông tin đăng nhập sai. Vui lòng kiểm tra lại."
							});
							$('#email').focus();
						}
					})
					.catch(error => {
						Toast.fire({
							icon: "error",
							title: "Có lỗi khi đăng ký, vui lòng thử lại."
						});
						//setTimeout(() => window.location.reload(), 3000);
					});
			}

			return false;
		});
	}

	$(document).ready(function () {
		handleRedirectIsLogin();
		handleFormSignIn();
	});
})
(jQuery);