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

			}

			return false;
		});
	}

	$(document).ready(function () {
		handleFormSignIn();
	});
})
(jQuery);