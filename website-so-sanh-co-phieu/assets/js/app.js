;(function ($) {
	'use strict';
	let dataIndustry = [];
	const filterIndustry = $('#filterIndustry');
	const filterStock1 = $('#filterStock1');
	const filterStock2 = $('#filterStock2');
	
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
			
			
			$('#filterResult').show();
			handleInitialChart();
			handleInitialTooltip();
			handleInitialTab();
			handleCollapseTable();
		});
	}
	
	const handleInitialChart = function () {
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
								label: 'PVS',
								data: [ 30, 28, 24, 20 ],
								borderColor: '#099444',
								backgroundColor: '#82ffb8',
								tension: 0.4
							},
							{
								label: 'YEG',
								data: [ 45, 20, 35, 50 ],
								borderColor: '#0e6096',
								backgroundColor: '#86cdff',
								tension: 0.4
							},
							{
								label: 'CTG',
								data: [ 74, 78, 54, 23 ],
								borderColor: '#85560b',
								backgroundColor: '#ffcb7f',
								tension: 0.4
							},
							{
								label: 'VCB',
								data: [ 80, 66, 78, 92 ],
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
		const tooltipList = [ ...tooltipTriggerList ].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
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
		handleLoadPage();
	});
})
(jQuery);