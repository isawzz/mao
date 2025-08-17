
async function onclickAll(ev) {
	hToggleClassMenu(ev); mClear('dTable');

	let dTable = mBy('dTable'); mStyle('dTable', { padding: 10, display: 'flex', wrap: 'true', acontent: 'start', gap: 10 });

	let d1 = mDom(dTable, { display: 'flex', dir: 'column', padding: 10, gap: 10, className: 'input' });
	mDom(d1, {}, { html: 'normal:' })
	let inputs = ['xmin','xmax', 'percent', 'mean', 'stdev'];
	for (const name of inputs) {
		mInput(d1, { hpadding: 10, vpadding: 2 }, `inp_n${name}`, `<Enter ${name}>`, 'input', 0, '', true, 'number');
	}
	mDom(d1, { hpadding: 10, vpadding: 2, className: 'input' }, { tag: 'button', html: `GO!`, onclick: onclickNormalAlles });
	mDom(d1, { hpadding: 10, vpadding: 2, className: 'input' }, { tag: 'button', html: `clear`, onclick: onclickNormalClear });
	mDom(d1, {}, { html: 'min:' })
	mDom(d1, { hpadding: 10, vpadding: 2, className: 'input' }, { id: `result_min`, html: '&nbsp;' });
	mDom(d1, {}, { html: 'max:' })
	mDom(d1, { hpadding: 10, vpadding: 2, className: 'input' }, { id: `result_max`, html: '&nbsp;' });
	mDom(d1, {}, { html: 'f(x):' })
	mDom(d1, { hpadding: 10, vpadding: 2, className: 'input' }, { id: `result_pdf`, html: '&nbsp;' });
	mDom(d1, {}, { html: 'F(x):' })
	mDom(d1, { hpadding: 10, vpadding: 2, className: 'input' }, { id: `result_cdf`, html: '&nbsp;' });


	mBy('inp_nxmin').value = 0; 
	mBy('inp_nxmax').value = 0; 
	mBy('inp_npercent').value = 90; 
	mBy('inp_nmean').value = 320; 
	mBy('inp_nstdev').value = 156;
}






