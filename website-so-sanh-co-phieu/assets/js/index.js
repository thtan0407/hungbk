;(function ($) {
	'use strict';
	let dataIndustry = [];
	const filterIndustry = $('#filterIndustry');
	const filterStock1 = $('#filterStock1');
	const filterStock2 = $('#filterStock2');

	const handleLoadPage = function () {
		const pathJson = './assets/json/stock.json';

		$.getJSON(pathJson)
			.done(function (data) {
				if (Object.keys(data).length > 0) {
					dataIndustry = data;
					handleFilterSelect();
					handleChangeIndustry();
					handleSubmitCompare();
				} else {
					Toast.fire({
						icon: "error",
						title: "Có lỗi khi tải trang, vui lòng thử lại"
					});

					setTimeout(() => window.location.reload(), 3000);
				}
			})
			.fail(function () {
				Toast.fire({
					icon: "error",
					title: "Có lỗi khi tải trang, vui lòng thử lại"
				});

				setTimeout(() => window.location.reload(), 3000);
			});
	}

	const handleFilterSelect = function () {
		filterIndustry.select2({
			templateResult: function (data, container) {
				if (data.element) {
					$(container).addClass($(data.element).attr("class"));
				}
				return data.text;
			},
			dropdownParent: filterIndustry.parent(),
			minimumResultsForSearch: 20,//Infinity
			language: 'vi',
			width: '100%',
			searchInputPlaceholder: filterIndustry.attr('data-search') ?? '',
		});

		filterStock1.select2({
			templateResult: function (data, container) {
				if (data.element) {
					$(container).addClass($(data.element).attr("class"));
				}
				return data.text;
			},
			dropdownParent: filterStock1.parent(),
			minimumResultsForSearch: 20,//Infinity
			language: 'vi',
			width: '100%',
			searchInputPlaceholder: filterStock1.attr('data-search') ?? '',
		});

		filterStock2.select2({
			templateResult: function (data, container) {
				if (data.element) {
					$(container).addClass($(data.element).attr("class"));
				}
				return data.text;
			},
			dropdownParent: filterStock2.parent(),
			minimumResultsForSearch: 20,//Infinity
			language: 'vi',
			width: '100%',
			searchInputPlaceholder: filterStock2.attr('data-search') ?? '',
		});
	}

	const handleChangeIndustry = function () {
		filterIndustry.change(() => {
			if (filterIndustry.val() > 0 && dataIndustry[filterIndustry.val()] !== undefined) {
				let optionStock = '<option value="-1">Chọn mã cổ phiếu</option>';
				dataIndustry[filterIndustry.val()].map(function (item, idx) {
					optionStock += `<option value="${ idx }">${ item }</option>`;
				});

				filterStock1.html(optionStock).trigger('change.select2');
				filterStock2.html(optionStock).trigger('change.select2');
			} else {
				Toast.fire({
					icon: "error",
					title: "Có lỗi khi tải trang, vui lòng thử lại"
				});

				setTimeout(() => window.location.reload(), 3000);
			}
		})
	}

	const handleSubmitCompare = function () {
		$('#submitCompare').click(function () {
			const filterIndustryValue = $('#filterIndustry').val();
			const filterStock1Value = $('#filterStock1').val();
			const filterStock2Value = $('#filterStock2').val();

			if (dataIndustry[filterIndustryValue] === undefined) {
				Toast.fire({
					icon: "error",
					title: "Vui lòng chọn ngành nghề."
				});

				return false;
			}

			if (parseInt(filterStock1Value) === -1 || parseInt(filterStock2Value) === -1 || dataIndustry[filterIndustryValue][filterStock1Value] === undefined) {
				Toast.fire({
					icon: "error",
					title: "Vui lòng chọn mã cổ phiếu. Lưu ý 2 mã cổ phiếu phải khác nhau"
				});

				return false;
			}

			if (parseInt(filterStock1Value) === parseInt(filterStock2Value)) {
				Toast.fire({
					icon: "error",
					title: "Vui lòng chọn 2 mã cổ phiếu khác nhau."
				});

				return false;
			}

			const filterResult = $('#filterResult');
			filterResult.show();
			filterResult.find('.nameStock1').html(dataIndustry[filterIndustryValue][filterStock1Value]);
			filterResult.find('.nameStock2').html(dataIndustry[filterIndustryValue][filterStock2Value]);

			handleInitialChart(filterIndustryValue, filterStock1Value, filterStock2Value);
			handleInitialTab();
		});
	}

	const handleInitialChart = function (filterIndustryValue, filterStock1Value, filterStock2Value) {
		const chartPreview = $('.chart-preview');
		if (chartPreview.length) {
			chartPreview.map((idx, item) => {
				const chart = $(item)[0].getContext('2d');

				const lineChart = new Chart(chart, {
					type: 'line',
					data: {
						labels: [ 'Q1', 'Q2', 'Q3', 'Q4' ],
						datasets: [
							{
								label: "Tổng thu nhập từ hoạt động kinh doanh",
								data: [ 30, 28, 24, 20 ],
								borderColor: '#099444',
								backgroundColor: '#82ffb8',
								tension: 0.4
							},
							{
								label: "Thu nhập lãi thuần",
								data: [ 45, 20, 35, 50 ],
								borderColor: '#0e6096',
								backgroundColor: '#86cdff',
								tension: 0.4
							},
							{
								label: "Lãi/Lỗ thuần từ hoạt động dịch vụ",
								data: [98, 28, 54, 90],
								borderColor: '#FF4069',
								backgroundColor: '#FFA0B4',
								tension: 0.4
							},
							{
								label: "Chi phí hoạt động",
								data: [15, 78, 50, 20],
								borderColor: '#FF9020',
								backgroundColor: '#FFCF9F',
								tension: 0.4
							},
							{
								label: "Dự phòng rủi ro cho vay khách hàng",
								data: [55, 30, 15, 80],
								borderColor: '#9966FF',
								backgroundColor: '#CCB2FF',
								tension: 0.4
							},
						]
					},
					options: {
						responsive: true,
						maintainAspectRatio: true,
						aspectRatio: 1 / 0.75,
						plugins: {
							legend: {
								labels: {
									color: '#ffffff',
									padding: 15,
									font: {
										size: 13,
									},
								},
								position: 'bottom',
							},
							title: {
								display: true,
								text: dataIndustry[filterIndustryValue][filterStock1Value],
								color: '#ffffff',
								padding:  {
									top: 7.5,
									bottom: 20
								},
								font: {
									size: 18,
									weight: 'bold',
								},
							}
						},
						layout: {
							padding: {
								bottom: 10
							}
						},
						scales: {
							y: {
								min: 0,
								max: 100,
								grid: {
									color: '#2D2D2D',
									drawTicks: false,
								},
								ticks: {
									color: '#ffffff',
									padding: 5
								},
							},
							x: {
								grid: {
									color: '#2d2d2d',
									drawTicks: false,
								},
								ticks: {
									color: '#ffffff',
									padding: 5
								},
							}
						}
					}
				});
			})
		}
	}

	const handleInitialTab = () => {
		const tabElement = $('.handleEffectTab');
		if (tabElement.length > 0) {

			tabElement.each(function () {
				const tabItem = $(this);

				const tabItemBackground = tabItem.find('.handleEffectTabLine');
				const tabItemButton = tabItem.find('.handleEffectTabItem');
				const tabItemButtonActive = tabItem.find('.handleEffectTabItem.active')[0];

				if (tabItemButtonActive != null) {
					setTimeout(() => {
						tabItemBackground.css({
							left: parseInt(tabItemButtonActive.offsetLeft) + "px",
							width: parseInt(tabItemButtonActive.offsetWidth) + "px",
							opacity: 1
						});
					}, 250)

					$(window).resize(function () {
						tabItemBackground.css({
							left: parseInt(tabItemButtonActive.offsetLeft) + "px",
							width: parseInt(tabItemButtonActive.offsetWidth) + "px",
							opacity: 1
						});
					});

					setTimeout(function () {
						tabItemButton.addClass('is-done');
						tabItemBackground.addClass('transition-default')
					}, 300)

					if (tabItemButton.length) {
						tabItemButton.each(function () {
							const tabElement = $(this);
							tabElement.on("click", function () {
								tabItemButton.removeClass("active");

								tabElement.addClass("active");
								tabItemBackground.css({
									left: parseInt(tabElement[0].offsetLeft) + "px",
									width: parseInt(tabElement[0].offsetWidth) + "px",
									opacity: 1
								});
							});
						})
					}
				}
			})
		}
	}

	$(document).ready(function () {
		handleLoadPage();
	});
})
(jQuery);