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
			filterStock.select2({
				templateResult: function (data, container) {
					if (data.element) {
						$(container).addClass($(data.element).attr("class"));
					}
					return data.text;
				},
				dropdownParent: filterStock.parent(),
				minimumResultsForSearch: 20,//Infinity
				language: 'vi',
				width: '100%',
				searchInputPlaceholder: filterStock.attr('data-search') ?? '',
			});
		}
	}

	const handleInitialChart = function () {
		const chartPreview = $('#chartPreview');
		if (chartPreview.length) {
			const chart = chartPreview[0].getContext('2d');

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
					plugins: {
						legend: {
							labels: {
								color: '#ffffff',
								padding: 50,
								font: {
									size: 15,
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
							title: {
								display: true,
								text: 'No of Potentials',
								color: '#ffffff',
								font: {
									size: 15,
									weight: 'bold',
								},
							}
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
		}
	}

	$(document).ready(function () {
		handleFilterSelect();
		handleInitialChart();
	});
})(jQuery);