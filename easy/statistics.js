function binomialCoefficient(n, k) {
  return factorial(n) / (factorial(k) * factorial(n - k));
}
function binomialCoefficient(n, k) {
  // Take advantage of symmetry property: C(n, k) = C(n, n-k)
  if (k > n - k) {
    k = n - k;
  }

  let result = 1;
  for (let i = 0; i < k; i++) {
    result *= (n - i);
    result /= (i + 1);
  }

  return result;
}
function binomialPdf(n, p, k) {
  if (k < 0 || k > n) {
    return 0;  // Binomial coefficient is 0 if k is out of range
  }
  
  const binomCoeff = binomialCoefficient(n, k);
  return binomCoeff * Math.pow(p, k) * Math.pow(1 - p, n - k);
}
function binomialCdf(n, p, lb, ub) {
  let cumulativeProbability = 0;
  
  // Sum the probabilities from lb to ub
  for (let k = lb; k <= ub; k++) {
    cumulativeProbability += binomialPdf(n, p, k);
  }

  return cumulativeProbability;
}
function binomialVariance(n, p) {
  return n * p * (1 - p);
}
function binomialStd(n, p) {
  return Math.sqrt(binomialVariance(n, p));
}
function calculateCDF(xValues, probabilities) {
	if (xValues.length !== probabilities.length) {
			throw new Error("The lengths of xValues and probabilities must be equal.");
	}

	// First, ensure the probabilities sum to 1 (normalization)
	const totalProbability = probabilities.reduce((sum, prob) => sum + prob, 0);
	const normalizedProbabilities = probabilities.map(prob => prob / totalProbability);

	// Calculate the cumulative distribution
	let cumulativeSum = 0;
	const cdf = normalizedProbabilities.map((prob, index) => {
			cumulativeSum += prob;
			return {
					x: xValues[index],
					cumulativeProbability: cumulativeSum
			};
	});

	return cdf;
}
function calculateExpectedValue(xlist,ylist){
	let res = 0;
	for (let i = 0; i < xlist.length; i++) {
		res += xlist[i] * ylist[i];
	}
	return res;

}
function calculateInterval(mu, sigma, percent) {
	// Check if the percent is between 0 and 100
	if (percent <= 0 || percent >= 100) {
			throw new Error("Percent must be between 0 and 100.");
	}
	
	// Convert the percent to a probability (central percent divided by 100)
	const p = percent / 100;
	
	// Find the z-score for the given central percentage (using the inverse CDF of the normal distribution)
	// Use a common approximation for the inverse CDF (quantile function)
	// This is for a two-tailed interval, so we need to find the z-score for (1 - p)/2 on each side
	const z = inverseCDF((1 + p) / 2);

	// Calculate the interval around the mean for the given normal distribution N(mu, sigma)
	const lowerBound = mu - z * sigma;
	const upperBound = mu + z * sigma;

	return [ lowerBound, upperBound ];
}
function calculateMean(values) {
	// Mean
	const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
	return mean;
}
function calculateStatistics(xlist,ylist){
	//compute expected value
	let n=xlist.length;
	let mu = 0;
	for (let i = 0; i < n; i++) {
		mu += xlist[i] * ylist[i];
	}
	//console.log('res', mu);
	//compute variance
	let v = 0;
	for (let i = 0; i < n; i++) {
		v += ylist[i] * (xlist[i] - mu) ** 2;
	}
	//console.log('v', v);

	//compute standard deviation
	let stdev=Math.sqrt(v);
	//console.log('std', Math.sqrt(v));

	const mean = xlist.reduce((sum, value) => sum + value, 0) / xlist.length;

	// Median
	const sortedValues = [...xlist].sort((a, b) => a - b);
	const mid = Math.floor(sortedValues.length / 2);
	const median = sortedValues.length % 2 === 0 ? 
			(sortedValues[mid - 1] + sortedValues[mid]) / 2 : 
			sortedValues[mid];

	// Mode
	const frequencyMap = {};
	let maxFreq = 0;
	let mode = [];

	xlist.forEach(value => {
			frequencyMap[value] = (frequencyMap[value] || 0) + 1;
			if (frequencyMap[value] > maxFreq) {
					maxFreq = frequencyMap[value];
					mode = [value];
			} else if (frequencyMap[value] === maxFreq) {
					mode.push(value);
			}
	});
	mode = [...new Set(mode)]; // Remove duplicates if multiple modes


	return {mu,v,stdev,mean,median,mode};

}
function calculateZ(x, mu, sigma) {
	if (sigma === 0) {
		throw new Error("Standard deviation cannot be zero.");
	}

	// Calculate the z-score
	const z = (x - mu) / sigma;
	return z;
}
function erf(x) {
  // Constants for approximation
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  // Save the sign of x
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  // A&S formula 7.1.26
  const t = 1 / (1 + p * x);
  const y = ((((((a5 * t + a4) * t) + a3) * t + a2) * t) + a1) * t;

  return sign * (1 - y * Math.exp(-x * x));
}
function factorial(x) {
  if (x === 0 || x === 1) {
    return 1;
  }
  return x * factorial(x - 1);
}
function formatFloatToDecimal(num,n=3) {
	// Convert the number to a float and limit to 4 decimal places
	return parseFloat(num.toFixed(n));
}
function getValuesFromInput(id){
	let input = document.getElementById(id).value;
	input = replaceCommasWithDots(input);
	// let values = input.split(' ').map(num => parseFloat(num.trim())).filter(num => !isNaN(num));
	let values = input.split(' ').map(s => eval(s.trim())).map(num=>parseFloat(num)).filter(num => !isNaN(num));
	//values.sort();
	console.log(values);
	return values;

}
function inverseCDF(p) {
	// Constants for approximation of the inverse CDF of the normal distribution
	const a1 = -3.969683028665376e+01;
	const a2 = 2.209460984245205e+02;
	const a3 = -2.759285104469687e+02;
	const a4 = 1.383577518672690e+02;
	const a5 = -3.066479806614716e+01;
	const a6 = 2.506628277459239e+00;

	const b1 = -5.447609879822406e+01;
	const b2 = 1.615858368580409e+02;
	const b3 = -1.556989798598866e+02;
	const b4 = 6.680131188771972e+01;
	const b5 = -1.328068155288572e+01;

	const c1 = -7.784894002430293e-03;
	const c2 = -3.223964580411365e-01;
	const c3 = -2.400758277161838e+00;
	const c4 = -2.549732539343734e+00;
	const c5 = 4.374664141464968e+00;
	const c6 = 2.938163982698783e+00;

	const d1 = 7.784695709041462e-03;
	const d2 = 3.224671290700398e-01;
	const d3 = 2.445134137142996e+00;
	const d4 = 3.754408661907416e+00;

	const pLow = 0.02425;
	const pHigh = 1 - pLow;

	let q, r;
	if (p < pLow) {
			q = Math.sqrt(-2 * Math.log(p));
			return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
						 ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
	} else if (p <= pHigh) {
			q = p - 0.5;
			r = q * q;
			return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
						 (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
	} else {
			q = Math.sqrt(-2 * Math.log(1 - p));
			return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
							((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
	}
}
function minTrialsForSuccess(x, p) {
	// Convert x percentage to a decimal

	console.log(x,p);

	const xDecimal = x; // / 100;

	// Calculate the minimum number of trials
	const trials = Math.ceil(Math.log(1 - xDecimal) / Math.log(1 - p));

	return trials;
}
function normalPdf(x, mean, stdDev) {
  const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
  const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
  return coefficient * Math.exp(exponent);
}
function normalCdf(x, mean, stdDev) {
  return 0.5 * (1 + erf((x - mean) / (stdDev * Math.sqrt(2))));
}
function normalCdfRange(min, max, mu, sigma) {
	// Error function approximation
	function erf1(x) {
		const sign = (x >= 0) ? 1 : -1;
		x = Math.abs(x);

		// Coefficients for approximation
		const a1 = 0.254829592;
		const a2 = -0.284496736;
		const a3 = 1.421413741;
		const a4 = -1.453152027;
		const a5 = 1.061405429;
		const p = 0.3275911;

		// Approximation formula
		const t = 1 / (1 + p * x);
		const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

		return sign * y;
	}

	// CDF of normal distribution
	function normalCdf1(x, mu, sigma) {
		return 0.5 * (1 + erf1((x - mu) / (sigma * Math.sqrt(2))));
	}

	const cdfMin = normalCdf1(min, mu, sigma);
	const cdfMax = normalCdf1(max, mu, sigma);

	return cdfMax - cdfMin;
}
function normalExpectedValue(mean) {
  return mean; // The expected value (mean) is simply the mean of the distribution
}
function normalVariance(stdDev) {
  return Math.pow(stdDev, 2); // Variance is the square of the standard deviation
}
function replaceCommasWithDots(inputString) {
	return inputString.replace(/,/g, '.');
}

