;(function ($) {
	'use strict';
	let dataIndustry = [];
	let mappingBCTC = [];
	let chartFields = {};
	let chartPreview1 = null;
	let chartPreview2 = null;
	let filterIndustryValue = null
	let filterStock1Value = null
	let filterStock2Value = null
	const filterIndustry = $('#filterIndustry');
	const filterStock1 = $('#filterStock1');
	const filterStock2 = $('#filterStock2');
	const filterResult = $('#filterResult');

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
					optionStock += `<option value="${item}">${item}</option>`;
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
			const buttonCompare = $(this);

			if(filterIndustryValue == $('#filterIndustry').val() && filterStock1Value == $('#filterStock1').val() && filterStock2Value == $('#filterStock2').val()) {
				return null;
			}

			buttonCompare.prop('disabled', true);

			filterIndustryValue = $('#filterIndustry').val();
			filterStock1Value = $('#filterStock1').val();
			filterStock2Value = $('#filterStock2').val();

			if (dataIndustry[filterIndustryValue] === undefined) {
				Toast.fire({
					icon: "error",
					title: "Vui lòng chọn ngành nghề."
				});
				buttonCompare.prop('disabled', false);
				return false;
			}

			if (parseInt(filterStock1Value) === -1 || parseInt(filterStock2Value) === -1) {
				Toast.fire({
					icon: "error",
					title: "Vui lòng chọn mã cổ phiếu. Lưu ý 2 mã cổ phiếu phải khác nhau"
				});
				buttonCompare.prop('disabled', false);
				return false;
			}

			if (filterStock1Value === filterStock2Value) {
				Toast.fire({
					icon: "error",
					title: "Vui lòng chọn 2 mã cổ phiếu khác nhau."
				});
				buttonCompare.prop('disabled', false);
				return false;
			}

			const urlAPI = `http://20.89.170.203:8000/mapping-bctc`;

			fetch(urlAPI)
				.then(response => response.json())
				.then(data => {
					if (Object.keys(data).length > 0) {
						mappingBCTC = data[filterIndustryValue];
						chartFields = mappingBCTC.colunm_chart.map((key, index) => {
							return {
								key: key,
								label: mappingBCTC.column_mapping[key] || key,
								borderColor: arrColors[index % arrColors.length].borderColor,
								background: arrColors[index % arrColors.length].background
							}
						});

						handleRenderStock(filterIndustryValue, filterStock1Value, 'quy', '#chartPreview', chartPreview1)
							.then(chart => {
								if (chart) {
									chartPreview1 = chart;
									handleRenderTable()
								}
							});

						handleRenderStock(filterIndustryValue, filterStock2Value, 'quy', '#chartPreview2', chartPreview2)
							.then(chart => {
								if (chart) {
									chartPreview2 = chart;
									handleRenderTable()
								}
							});

						filterResult.show();
						filterResult.find('.nameStock1').html(filterStock1Value);
						filterResult.find('.nameStock2').html(filterStock2Value);

						handleInitialTab();
						buttonCompare.prop('disabled', false);
					} else {
						Toast.fire({
							icon: "error",
							title: "Có lỗi xảy ra, vui lòng thử lại."
						});

						buttonCompare.prop('disabled', false);
						setTimeout(() => window.location.reload(), 3000);
					}
				})
				.catch(error => {
					Toast.fire({
						icon: "error",
						title: "Có lỗi xảy ra, vui lòng thử lại."
					});
					console.error('Lỗi fetch:', error);
					buttonCompare.prop('disabled', false);
					//setTimeout(() => window.location.reload(), 3000);
				});
		});
	}

	const handleRenderStock = (stockType, stockCode, chartType = 'quy', chartItem = '', chartPreview) => {
		const urlAPI = `http://20.89.170.203:8000/stocks?stockCode=${stockCode}&stockType=${stockType}`;

		return fetch(urlAPI)
			.then(response => {
				if (!response.ok) throw new Error(`HTTP status ${response.status}`);
				return response.json();
			})
			.then(data => {
				if (data[chartType] && data[chartType].length > 0) {
					return handleInitialChart(stockCode, data[chartType], chartItem, chartPreview);
				} else {
					Toast.fire({
						icon: "error",
						title: "Không có dữ liệu biểu đồ"
					});
					return null;
				}
			})
			.catch(error => {
				Toast.fire({
					icon: "error",
					title: "Có lỗi khi gọi dữ liệu"
				});
				console.error('Lỗi fetch:', error);
				return null;
			});
	};


	const arrColors = [
		{
			borderColor: '#099444',
			background: '#82ffb8'
		},
		{
			borderColor: '#0e6096',
			background: '#86cdff'
		},
		{
			borderColor: '#FF9020',
			background: '#FFCF9F'
		},
		{
			borderColor: '#9966FF',
			background: '#CCB2FF'
		},
		{
			borderColor: '#FF4069',
			background: '#FFA0B4'
		}
	]

	const generateDataSets = (dataStock) => {
		return chartFields.map(field => ({
			label: field.label,
			data: dataStock.map(item => item[field.key] ?? 0),
			borderColor: field.borderColor,
			backgroundColor: field.background, // thêm độ mờ
			tension: 0.4
		}));
	}

	const generateLabels = (dataStock) => {
		return dataStock.map(item => `Q${item.ky} - ${item.nam}`);
	}

	const handleInitialChart = function (stockCode, stockValue, chartItem, chartPreview) {
		const chart = $(chartItem);
		if (!chart.length) return null;


		const chx = chart[0].getContext('2d');

		const labels = generateLabels(stockValue);
		const dataSets = generateDataSets(stockValue);

		const divisor = 1_000_000_000;

		const allValues = dataSets.flatMap(ds => ds.data);
		const minY = Math.min(...allValues) / divisor;
		const maxY = Math.max(...allValues) / divisor;

		const convertedDatasets = dataSets.map(ds => ({
			...ds,
			data: ds.data.map(val => val / divisor)
		}));

		// Update lại chart nếu gọi từ lần 2
		if (chartPreview && chartPreview instanceof Chart) {
			chartPreview.data.labels = labels;
			chartPreview.data.datasets = convertedDatasets;
			chartPreview.options.scales.y.min = minY;
			chartPreview.options.scales.y.max = maxY;
			chartPreview.options.plugins.title.text = stockCode;
			chartPreview.update();
			return chartPreview;
		}

		const chartInit = new Chart(chx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: convertedDatasets
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
					tooltip: {
						callbacks: {
							label: function (context) {
								const label = context.dataset.label || '';
								const value = context.parsed.y;
								return `${label}: ${value.toLocaleString('en-US', {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2
								})} tỷ`;
							}
						}
					},
					title: {
						display: true,
						text: stockCode,
						color: '#ffffff',
						padding: {
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
						min: minY,
						max: maxY,
						ticks: {
							color: '#ffffff',
							padding: 5,
							callback: val => val.toLocaleString('en-US') + ' tỷ'
						},
						grid: {
							color: '#2D2D2D',
							drawTicks: false,
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

		return chartInit
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