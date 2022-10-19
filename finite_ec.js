var FiniteEC = function (a, b, r, w, h) {
	this.a = a, this.b = b, this.r = r, this.w = w, this.h = h;
	this.points = [];
	this.selectedIndex = -1;
	
	// calculate points
	for (let i=0; i<this.r; i++){
		const y2 = (i*i*i + a*i + b) % this.r;
		for (let j=0; j<this.r; j++) {
			if (j*j%r==y2) {
				this.points.push({x:i, y:j});
			} 
		}
	}
  
	this.inverse = function(x, r) {
		if (x < 0) x = r - (-x % r);
		for (let i=0; i<r; i++) {
			if (i*x % r == 1) return i;
		}
		return Infinity;
	}

	this.add = function(p1, p2) {
		let lambda;
		if (p1.x == p2.x && p1.y == p2.y) lambda = (3*p1.x*p1.x + this.a)*this.inverse(2*p1.y, this.r);
		else lambda = (p1.y - p2.y)*this.inverse(p1.x - p2.x, this.r);
		let xr = lambda*lambda - p1.x - p2.x;
		let yr = lambda*(p1.x - xr) - p1.y;
		if (xr < 0 && xr > -Infinity) xr = this.r - (-xr % this.r);
		if (yr < 0 && yr > -Infinity) yr = this.r - (-yr % this.r);
		return {x: xr % this.r, y: yr % this.r};
	}

	this.mul = function(p, k) {
		let q = {...p};
		for (i=1; i<k; i++){
			q = this.add(q, p);
		}
		return q;
	}

	this.getSubGroup = function(p) {
		const subGrp = [];
		for(let i=0; i<=this.r; i++){
			const q = this.mul(p, i+1);
			subGrp.push(q);
			if (isNaN(q.x) && isNaN(q.y)) break;
		}
		return subGrp;
	}
	
	this.draw = function() {
		const xMargin = 20;		
		const yMargin = 20;
		const xStep = (this.w - xMargin) / this.r;
		const yStep = (this.h - yMargin) / this.r;
		
		// origin
		noStroke();
		fill(0);
		text("0", 5, h-yMargin); 
		ellipse(xMargin, h-yMargin,2,2);
		
		// y axis
		strokeWeight(1);
		stroke(0);
		line(xMargin, 0, xMargin, h - yMargin)
		for ( let i=1; i < this.r; i++){
			strokeWeight(0.25);
			stroke("#aaa");
			line(xMargin + i*xStep, 0, xMargin + i*xStep, h - yMargin)

			noStroke();
			fill(0);
			ellipse(xMargin, h - (i*yStep) - yMargin, 3, 3);
			text("" + i, 2, h - (i*yStep) - yMargin);
		}
		
		// x axis
		strokeWeight(1);
		stroke(0);
		line(xMargin, h - yMargin, w, h - yMargin);
		for ( let i=0; i < this.r; i++){
			strokeWeight(0.25);
			stroke("#aaa");
			line(xMargin, h - yMargin - i*yStep, w, h-yMargin - i* yStep);

			noStroke();
			fill(0);
			ellipse(i*xStep + xMargin, h-yMargin, 3, 3);
			text("" + i, i*xStep + xMargin - 4, h-yMargin + 15);
		}

		// ec points
		for (let i=0; i<this.points.length; i++){
			if (i != this.selectedIndex) {
				fill("#0f0");
				ellipse(this.points[i].x * xStep + xMargin, (this.r - this.points[i].y) * yStep, 8, 8);
			} else {
				fill("#00f");
				ellipse(this.points[i].x * xStep + xMargin, (this.r - this.points[i].y) * yStep, 8, 8);
				fill(0)
				text(`(${this.points[i].x},${this.points[i].y})`,this.points[i].x * xStep + xMargin + 5, (this.r - this.points[i].y) * yStep);
			}
		}
	}

	this.mouseClicked = function(mx, my) {
		const xMargin = 20;		
		const yMargin = 20;
		const xStep = (this.w - xMargin) / this.r;
		const yStep = (this.h - yMargin) / this.r;
		for (let i=0; i<this.points.length; i++){
			fill("#0f0");
			const px = this.points[i].x * xStep + xMargin;
			const py = (this.r - this.points[i].y) * yStep;
			const d = Math.sqrt((mx - px)**2 + (my - py)**2)
			if (d < 5) this.selectedIndex = i;
		}		
	}
}