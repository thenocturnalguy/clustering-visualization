// Helper functions
var euclidean = (x1, y1, x2, y2) => Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
var minIndex = arr => arr.indexOf(Math.min(...arr));
var min = arr => Math.min(...arr);
var max = arr => Math.max(...arr);
var mean = arr => arr.reduce((a, b) => a + b, 0 ) / arr.length;

// K-means clustering module
const clustering = (function() {
	var canvas = document.createElement("canvas"),
			ctx = canvas.getContext("2d");
	canvas.width = 1000;
	canvas.height = 620;
	document.body.append(canvas);

	/*
	* x = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	* y = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	*/

	function generateDatapoints() {		
		return {
			x: [15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 23, 23, 24, 24, 25, 25, 28, 28, 28, 28, 29, 29, 30, 30, 33, 33, 33, 33, 34, 34, 37, 37, 38, 38, 39, 39, 39, 39, 40, 40, 40, 40, 42, 42, 43, 43, 43, 43, 44, 44, 46, 46, 46, 46, 47, 47, 48, 48, 48, 48, 48, 48, 49, 49, 50, 50, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 57, 57, 58, 58, 59, 59, 60, 60, 60, 60, 60, 60, 61, 61, 62, 62, 62, 62, 62, 62, 63, 63, 63, 63, 63, 63, 64, 64, 65, 65, 65, 65, 67, 67, 67, 67, 69, 69, 70, 70, 71, 71, 71, 71, 71, 71, 72, 72, 73, 73, 73, 73, 74, 74, 75, 75, 76, 76, 77, 77, 77, 77, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 79, 79, 81, 81, 85, 85, 86, 86, 87, 87, 87, 87, 87, 87, 88, 88, 88, 88, 93, 93, 97, 97, 98, 98, 99, 99, 101, 101, 103, 103, 103, 103, 113, 113, 120, 120, 126, 126, 137, 137],

			y: [39, 81, 6, 77, 40, 76, 6, 94, 3, 72, 14, 99, 15, 77, 13, 79, 35, 66, 29, 98, 35, 73, 5, 73, 14, 82, 32, 61, 31, 87, 4, 73, 4, 92, 14, 81, 17, 73, 26, 75, 35, 92, 36, 61, 28, 65, 55, 47, 42, 42, 52, 60, 54, 60, 45, 41, 50, 46, 51, 46, 56, 55, 52, 59, 51, 59, 50, 48, 59, 47, 55, 42, 49, 56, 47, 54, 53, 48, 52, 42, 51, 55, 41, 44, 57, 46, 58, 55, 60, 46, 55, 41, 49, 40, 42, 52, 47, 50, 42, 49, 41, 48, 59, 55, 56, 42, 50, 46, 43, 48, 52, 54, 42, 46, 48, 50, 43, 59, 43, 57, 56, 40, 58, 91, 29, 77, 35, 95, 11, 75, 9, 75, 34, 71, 5, 88, 7, 73, 10, 72, 5, 93, 40, 87, 12, 97, 36, 74, 22, 90, 17, 88, 20, 76, 16, 89, 1, 78, 1, 73, 35, 83, 5, 93, 26, 75, 20, 95, 27, 63, 13, 75, 10, 92, 13, 86, 15, 69, 14, 90, 32, 86, 15, 88, 39, 97, 24, 68, 17, 85, 23, 69, 8, 91, 16, 79, 28, 74, 18, 83]
		}
	}

	function drawAxis(range) {
		ctx.beginPath();
		var cellX = canvas.width / 10,
				cellY = canvas.height / 10;

		for (var i = 0; i < canvas.width; i += cellX) {
			ctx.moveTo(i, 0);
			ctx.lineTo(i, canvas.height);
		}

		for (var i = 0; i < canvas.height; i += cellY) {
			ctx.moveTo(0, i);
			ctx.lineTo(canvas.width, i);
		}

		ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";

		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.closePath();
	}

	function drawPoint(x, y, range, radius=5, color="#ffc300") {

		point = scale(x, y, range);

		ctx.beginPath();
		ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
		ctx.fillStyle = color;
		ctx.fill();
		ctx.closePath();
	}

	function drawCluster(x, y, range, radius=100) {

		point = scale(x, y, range);

		ctx.beginPath();
		ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
		ctx.strokeStyle = "white";
		ctx.lineWidth = 2;
		ctx.stroke();
		ctx.closePath();

		ctx.beginPath();
		ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI, false);
		ctx.fillStyle = "rgb(45 255 147)";
		ctx.fill();
		ctx.closePath();
	}

	function scale(x, y, range) {
		var scaleX = canvas.width / parseFloat(range.x.upper - range.x.lower),
				scaleY = canvas.height / parseFloat(range.y.upper - range.y.lower),

		x = x * scaleX;
		y = y * scaleY;

		x -= range.x.lower * scaleX;
		y -= range.y.lower * scaleY;
		
		return {
			x: x,
			y: y
		}
	}

	function plot(xs, ys, range) {
		var x, y, radius = 5, len = xs.length;

		for (var i = 0; i < len; ++i) {
			drawPoint(xs[i], ys[i], range, radius);
		}
	}

	function kMeans(xs, ys, k, range, clusterColors) {
		var i, j, m = 0, len = xs.length,	closestCluster, centroids = [], distances = [], clusters = [], success = 0, meanX, meanY;

		// Take random centroids initially
		for (i = 0; i < k; ++i) {
			idx = Math.floor(Math.random() * len);
			centroids.push({
				x: xs[idx],
				y: ys[idx]
			});
			drawCluster(xs[idx], ys[idx], range, 140)
			clusters[i] = [];
		}
			
		var si = setInterval(function() {

			if (success >= k) {
				clearInterval(si);
			} else {
				success = 0;
			}

			for (i = 0; i < len; ++i) {

				// Calculate the distance of each point from the centroids
				for (j = 0; j < k; ++j) {
					distances[j] = euclidean(
							xs[i],
							ys[i],
							centroids[j].x,
							centroids[j].y
						);
				}
				closestCluster = minIndex(distances);
				clusters[closestCluster].push({
					x: xs[i],
					y: ys[i]
				});
			}

			// Updating the centroids
			for (i = 0; i < k; ++i) {
				meanX = 0;
				meanY = 0;
				for (j = 0; j < clusters[i].length; ++j) {
					meanX += clusters[i][j].x;
					meanY += clusters[i][j].y;
				}

				meanX /= clusters[i].length;
				meanY /= clusters[i].length;

				if (meanX - centroids[i].x < 1e-5 && 
						meanY - centroids[i].y < 1e-5) {
					success++;
				}

				centroids[i].x = meanX;
				centroids[i].y = meanY;

			}

			ctx.fillStyle = "rgba(25, 23, 144, 0.7)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			drawAxis(range);

			for (i = 0; i < k; ++i) {

				for (j = 0; j < clusters[i].length; ++j) {
					drawPoint(clusters[i][j].x, clusters[i][j].y, range, 5, clusterColors[i]);
				}
				drawCluster(centroids[i].x, centroids[i].y, range, 140);
				clusters[i] = [];
			}	

			console.log("Iterating..");		
		}, 200);
	}

	function reset(dataPoints, range) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		clustering.drawAxis(range);
		clustering.plot(
					dataPoints.x,
					dataPoints.y,
					range
				);
	}

	return {
		generate: generateDatapoints,
		plot: plot,
		drawAxis: drawAxis,
		kMeans: kMeans,
		reset
	}
})();




// Start the clustering 

var numClusters = 5, 
		clusterColors = [
											"#e91e63",
											"#03a9f4",
											"white",
											"#ffeb3b",
											"#907dff"
										];
var dataPoints = clustering.generate();

var range = {
	x: {
		lower: min(dataPoints.x),
		upper: max(dataPoints.x)
	},
	y: {
		lower: min(dataPoints.y),
		upper: max(dataPoints.y)
	}
};

clustering.drawAxis(range);
clustering.plot(
			dataPoints.x,
			dataPoints.y,
			range
		);


document.querySelector("#btnStart").addEventListener("click", function() {
	clustering.kMeans(
			dataPoints.x,
			dataPoints.y,
			numClusters,
			range,
			clusterColors
		);
})

document.querySelector("#btnReset").addEventListener("click", function() {
	clustering.reset(
				dataPoints,
				range
			);
});

