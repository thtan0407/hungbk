;(function ($) {
	'use strict';

	const handleFilterSelect = function () {
		const filterIndustry = $('#filterIndustry');

		if (filterIndustry.length) {
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
		}

		const filterStock = $('#filterStock');

		if (filterStock.length) {
			$.fn.select2.amd.require(['select2/i18n/vi'], function (vi) {
				// Ghi đè maximumSelected
				vi.maximumSelected = function (args) {
					return "Chỉ được chọn 2 mã cổ phiếu";
				};

				// Gán lại vào Select2
				$.fn.select2.defaults.set("language", vi);

				// Gọi select2
				filterStock.select2({
					templateResult: function (data, container) {
						if (data.element) {
							$(container).addClass($(data.element).attr("class"));
						}
						return data.text;
					},
					dropdownParent: filterStock.parent(),
					minimumResultsForSearch: 20,
					maximumSelectionLength: 2,
					language: 'vi',
					width: '100%',
					searchInputPlaceholder: filterStock.attr('data-search') ?? '',
				});
			});
		}
	}

	const handleInitialChart = function () {
		const chartPreview = $('.chart-preview');
		if (chartPreview.length) {
			chartPreview.map((idx, item) => {
				const chart = $(item)[0].getContext('2d');

				const lineChart = new Chart(chart, {
					type: 'line',
					data: {
						labels: ['Q1', 'Q2', 'Q3', 'Q4'],
						datasets: [
							{
								label: 'PVS',
								data: [30, 28, 24, 20],
								borderColor: '#099444',
								backgroundColor: '#82ffb8',
								tension: 0.4
							},
							{
								label: 'YEG',
								data: [45, 20, 35, 50],
								borderColor: '#0e6096',
								backgroundColor: '#86cdff',
								tension: 0.4
							},
							{
								label: 'CTG',
								data: [74, 78, 54, 23],
								borderColor: '#85560b',
								backgroundColor: '#ffcb7f',
								tension: 0.4
							},
							{
								label: 'VCB',
								data: [80, 66, 78, 92],
								borderColor: '#FF6384',
								backgroundColor: '#FFB1C1',
								tension: 0.4
							}
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
									padding: 50,
									font: {
										size: 17,
										weight: 'bold',
									},
								},
								position: 'bottom',
							},
						},
						layout: {
							padding: {
								bottom: 30 // 👈 giãn toàn khối legend với chart
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
								/*title: {
									display: true,
									text: 'No of Potentials',
									color: '#ffffff',
									font: {
										size: 15,
										weight: 'bold',
									},
								}*/
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
								title: {
									display: true,
									text: 'Quarter',
									color: '#ffffff',
									font: {
										size: 15,
										weight: 'bold',
									},
								}
							}
						}
					}
				});
			})
		}
	}

	const handleInitialTooltip = function () {
		const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
		const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
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

	const handleCollapseTable = function () {
		if ($('.chartCollapseButton').length) {
			$('.chartCollapseButton').click(function () {
				const chartCollapseButton = $(this);
				const chartCollapseButtonText = chartCollapseButton.html();
				if (chartCollapseButton.parents('.chart-content').find('.collapse').hasClass('show')) {
					chartCollapseButton.parents('.chart-content').find('.collapse').collapse('hide');
					chartCollapseButton.html(chartCollapseButtonText);
				} else {
					chartCollapseButton.parents('.chart-content').find('.collapse').collapse('show');
					chartCollapseButton.html('Thu gọn');
				}
			});
		}
	}

	$(document).ready(function () {
		handleFilterSelect();
		handleInitialChart();
		handleInitialTooltip();
		handleInitialTab();
		handleCollapseTable();
	});
})(jQuery);