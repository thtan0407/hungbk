;(function ($) {
	'use strict';
	let dataIndustry = [];
	let mappingBCTC = [];
	let chartFields = {};
	let chartPreview1 = null;
	let chartPreview2 = null;
	let dataRaw1 = null;
	let dataRaw2 = null;
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

	const handleSubmitCompare = function (period = 'quy') {
		const urlAPI = `http://20.89.170.203:8000/mapping-bctc`;

		fetch(urlAPI)
			.then(response => response.json())
			.then(data => {
				if (Object.keys(data).length > 0) {
					mappingBCTC = data[filterIndustryValue];

					chartFields = mappingBCTC.colunm_chart.map((key, index) => ({
						key: key,
						label: mappingBCTC.column_mapping[key] || key,
						borderColor: arrColors[index % arrColors.length].borderColor,
						background: arrColors[index % arrColors.length].background
					}));

					// Gọi song song 2 cổ phiếu
					return Promise.all([
						handleRenderStock(filterIndustryValue, filterStock1Value, period, '#chartPreview', chartPreview1),
						handleRenderStock(filterIndustryValue, filterStock2Value, period, '#chartPreview2', chartPreview2)
					]);
				} else {
					throw new Error("Dữ liệu cấu hình trống");
				}
			})
			.then(([dataChart1, dataChart2]) => {
				if (!dataChart1 || !dataChart2) {
					throw new Error("Thiếu dữ liệu biểu đồ");
				}

				// Lưu chart để sử dụng sau này
				chartPreview1 = dataChart1.chart;
				chartPreview2 = dataChart2.chart;

				dataRaw1 = dataChart1.rawData;
				dataRaw2 = dataChart2.rawData;

				// Render bảng
				handleRenderTable(dataRaw1, filterIndustryValue, filterStock1Value, period, '#tablePreview');
				handleRenderTable(dataRaw2, filterIndustryValue, filterStock2Value, period, '#tablePreview2');

				// Cập nhật UI
				filterResult.show();
				filterResult.find('.nameStock1').html(filterStock1Value);
				filterResult.find('.nameStock2').html(filterStock2Value);
				handleChangePeriod();
				handleInitialTab();
				$('#submitCompare').prop('disabled', false);
			})
			.catch(error => {
				Toast.fire({
					icon: "error",
					title: "Đã xảy ra lỗi khi xử lý dữ liệu. Vui lòng thử lại!"
				});
				$('#submitCompare').prop('disabled', false);
				console.error("Lỗi tổng:", error);
				setTimeout(() => window.location.reload(), 3000);
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
					const rawData = data[chartType];
					const chart = handleInitialChart(stockCode, rawData, chartItem, chartType, chartPreview);

					return {
						chart,
						rawData
					};

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

	const generateLabels = (dataStock, chartType) => {
		if (chartType === 'nam') {
			return dataStock.map(item => `Năm ${item.nam}`);
		} else {
			return dataStock.map(item => `Q${item.ky} - ${item.nam}`);
		}
	}

	const handleInitialChart = function (stockCode, stockValue, chartItem, chartType, chartPreview) {
		const chart = $(chartItem);
		if (!chart.length) return null;


		const chx = chart[0].getContext('2d');

		const labels = generateLabels(stockValue, chartType);
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

	const getLatestTime = (data, count = 4) => {
		return data
			.filter(item => item.nam && item.ky)
			.sort((a, b) => {
				if (b.nam !== a.nam) return b.nam - a.nam;
				return b.ky - a.ky;
			})
			.slice(0, count);
	};

	const formatNumber = function (val) {
		if (val == null) return '-';
		const num = Number(val);
		if (isNaN(num)) return val;
		let formattedNumber = (num / 1_000_000).toLocaleString('en-US', {maximumFractionDigits: 0});

		if (formattedNumber === '-0') {
			formattedNumber = '0';
		}

		return formattedNumber;
	};

	const handleRenderTable = function (data, stockType, stockCode, chartType, tablePreview) {
		$(tablePreview + ' .tablePreviewPeriod').html(chartType === 'quy' ? "quý" : "năm");

		const sortedData = getLatestTime(data, 4);

		$(tablePreview + ' .tablePreviewTime').empty();

		sortedData.forEach(item => {
			if (item.nam && item.ky) {
				const $item = $(`
				<div class="chart-table_time__list___item">
					<span>Quý ${item.ky}/${item.nam}</span>
					<span>Hợp nhất/CKT</span>
				</div>
			`);
				$(tablePreview + ' .tablePreviewTime').append($item);
			}
		});

		$(tablePreview + ' .tablePreviewBody').empty();
		let renderRow = `<div class="chart-table_item">
												<div class="chart-table_item__heading">
													Kết quả kinh doanh
												</div>`;

		const columnMapping = mappingBCTC.column_mapping;

		const keysToShow = Object.keys(columnMapping).filter(key => !['cp', 'nam', 'ky'].includes(key));

		keysToShow.forEach(fieldKey => {
			renderRow += `
			<div class="chart-table_item__child">
				<div class="chart-table_item__wrapper">
					<div class="chart-table_item__title">${columnMapping[fieldKey]}</div>
					<div class="chart-table_item__row">`;
			sortedData.forEach(item => {
				const val = formatNumber(item[fieldKey]);
				renderRow += `<div class="chart-table_item__column">${val.toLocaleString('en-US')}</div>`;
			});
			renderRow += `
					</div>
				</div>
			</div>
		`;
		});

		renderRow += `</div>`;
		$(tablePreview + ' .tablePreviewBody').html(renderRow)
	}

	const handleChangePeriod = function () {
		const buttonChangePeriod = $('.handleChangePeriod');
		if (!buttonChangePeriod.length) {
			return false;
		}

		buttonChangePeriod.off().click(function () {
			if ($(this).hasClass('active') || ![1, 2].includes(parseInt($(this).attr('data-value')))) {
				return false;
			}

			let periodValue = parseInt($(this).attr('data-value')) === 2 ? 'nam' : 'quy';

			buttonChangePeriod.removeClass('active button-theme').addClass('button-theme_secondary');
			$(this).addClass('active button-theme').removeClass('button-theme_secondary');

			handleSubmitCompare(periodValue);

			$('#submitCompare').attr('data-value', parseInt($(this).attr('data-value')))
		});
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
							const clickedTab = $(this);

							clickedTab.on("click", function () {
								if (clickedTab.hasClass('active')) return false;

								const value = clickedTab.attr('data-value');

								// ✅ Lặp qua tất cả các block tab
								$('.handleEffectTab').each(function () {
									const tabBlock = $(this);
									const tabButtons = tabBlock.find('.handleEffectTabItem');
									const tabBackground = tabBlock.find('.handleEffectTabLine');
									const targetTab = tabButtons.filter(`[data-value="${value}"]`);

									if (!targetTab.length) return;

									tabButtons.removeClass('active');
									targetTab.addClass('active');

									tabBackground.css({
										left: targetTab[0].offsetLeft + "px",
										width: targetTab[0].offsetWidth + "px",
										opacity: 1
									});
								});

								// Gọi sự kiện change filter nếu cần
								$(`.handleChangePeriod[data-value="${value}"]`).trigger('click');
							});
						});
					}
				}
			})
		}
	}

	$(document).ready(function () {
		handleLoadPage();

		$('#submitCompare').click(function () {
			const buttonCompare = $(this);

			if (filterIndustryValue == $('#filterIndustry').val() && filterStock1Value == $('#filterStock1').val() && filterStock2Value == $('#filterStock2').val()) {
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
			let periodValue = parseInt(buttonCompare.attr('data-value')) === 2 ? 'nam' : 'quy';
			handleSubmitCompare(periodValue)
		});
	});
})
(jQuery);