const Toast = Swal.mixin({
	toast: true,
	position: "top-end",
	showConfirmButton: false,
	timer: 3000,
	timerProgressBar: true,
	didOpen: (toast) => {
		toast.onmouseenter = Swal.stopTimer;
		toast.onmouseleave = Swal.resumeTimer;
	}
});

const handleRedirectIsLogin = (access = false) => {
	const isLogin = localStorage.getItem('login');
	
	if(access) return isLogin;
	
	if (isLogin) {
		location.href = './';
	}
}