
async function onclickNormalClear(ev) {
	let inputs = ['xmin','xmax', 'percent', 'mean', 'stdev'];
	for (const name of inputs) {
		mBy(`inp_n${name}`).value = '';
	}

	let names = ['min', 'max', 'pdf', 'cdf'];
	for (const name of names) {
		mBy(`result_${name}`).innerHTML = '&nbsp;';
	}
}
async function onclickNormalAlles(ev) {
	let xmin = +mBy('inp_nxmin').value;
	let xmax = +mBy('inp_nxmax').value;
	let percent = +mBy('inp_npercent').value;
	let mean = +mBy('inp_nmean').value;
	let stdev = +mBy('inp_nstdev').value;
	if (!isNaN(percent)) {
		let res = calculateInterval(mean, stdev, percent);
		mBy('result_min').innerHTML = res[0];
		mBy('result_max').innerHTML = res[1];
	}else{
		if (isNaN(xmin)) xmin = -Infinity; 
		if (isNaN(xmax)) xmax = Infinity;
		mBy('result_cdf').innerHTML = normalBetween(xmin,xmax, mean, stdev);
	}
}

function normalGreaterThan(x, mean, stdev) {
	let res = jStat.normal.cdf(x, mean, stdev);
	return 1 - res;
}
function normalBetween(x1, x2, mean, stdev) {
	let res = jStat.normal.cdf(x2, mean, stdev) - jStat.normal.cdf(x1, mean, stdev);
	return res;
}
