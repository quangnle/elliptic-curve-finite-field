var FiniteEC = function (a, b, r, w, h) {
	this.a = a, this.b = b, this.r = r, this.w = w, this.h = h;
	this.points = [];
	this.selectedIndex = -1;
	this.hoveredIndex= -1;
	
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
		if (p1.x == p2.x && p1.y == p2.y) lambda = (3*p1.x*p1.x + this.a)*this.inverse((2*p1.y) % this.r, this.r);
		else lambda = (p1.y - p2.y)*this.inverse(p1.x - p2.x, this.r);
		let xr = lambda*lambda - p1.x - p2.x;
		if (xr < 0 && xr > -Infinity) xr = this.r - (-xr % this.r);
		xr = xr % this.r;
		let yr = lambda*(p1.x - xr) - p1.y;
		if (yr < 0 && yr > -Infinity) yr = this.r - (-yr % this.r);
		yr = yr % this.r;
		return {x: xr, y: yr};
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
		for(let i=0; i<=this.points.length; i++){
			const q = this.mul(p, i+1);
			subGrp.push(q);
			if (isNaN(q.x) && isNaN(q.y)) break;
		}
		return subGrp;
	}

	// tobe updated
	this.getGPoint = function() {
		for (let i=0; i<this.points.length; i++){
			const sg = this.getSubGroup(this.points[i]);
			if (sg.length == this.points.length + 1) return this.points[i];
		}
		return null;
	}

	this.sign = function(m, dA) {
		const G = this.getGPoint();
		if (G == null) return null;
		const n = this.points.length + 1;
		const z = m % n;		
		do {
			const k = Math.floor(Math.random() * (n-2)) + 1;
			const kG = this.mul(G, k);
			if (kG.x == 0) continue;
			const r = kG.x;
			const s = (this.inverse(k, n)*(z + r*dA)) % n;
			if (s != 0) return {r, s};
		} while(true);
	}

	this.recoverPK = function(m,r,s) {
		const G = this.getGPoint();
		if (G == null) return null;
		const x1 = r;
		const y2 = (r*r*r + this.a*r + this.b) % this.r;
		let y1;
		for (let i=0; i< this.r; i++){
			if ((i*i % this.r) == y2) y=i;
		}
		const R = {x: x1, y:y1};
		const n = this.points.length + 1;
		const z = m % n;	
		const u1 = (n -(-z * this.inverse(r, n))) % n;
		const u2 = s * this.inverse(r, n);
		const u1G = this.mul(G, u1);
		const u2R = this.mul(R, u2);
		const QA = this.add(u1G, u2R);
		return QA;
	}

	this.verify = function (m,r,s) {
		const G = this.getGPoint();
		if (G == null) return null;
		const QA = this.recoverPK(m,r,s);
		const n = this.points.length + 1;
		const z = m % n;
		const u1 = z*this.inverse(s, n);
		const u2 = r * this.inverse(s, n);
		const u1G = this.mul(G, u1);
		const u2QA = this.mul(QA, u2);
		const S = this.add(u1G, u2QA);
		return r == S.x;
	}
	
	this.draw = function() {
		const xMargin = 20;		
		const yMargin = 20;
		const xStep = (this.w - xMargin) / this.r;
		const yStep = (this.h - yMargin) / this.r;
		textSize(8);
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
			if (i == this.hoveredIndex) {
				fill("#00a");
				ellipse(this.points[i].x * xStep + xMargin, (this.r - this.points[i].y) * yStep, 8, 8);
				fill(0)
				text(`(${this.points[i].x},${this.points[i].y})`,this.points[i].x * xStep + xMargin + 5, (this.r - this.points[i].y) * yStep);
			}

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
			const px = this.points[i].x * xStep + xMargin;2
			const py = (this.r - this.points[i].y) * yStep;
			const d = Math.sqrt((mx - px)**2 + (my - py)**2)
			if (d < 5) this.selectedIndex = i;
		}		
	}

	this.mouseMoved = function(mx, my) {
		const xMargin = 20;		
		const yMargin = 20;
		const xStep = (this.w - xMargin) / this.r;
		const yStep = (this.h - yMargin) / this.r;
		this.hoveredIndex= -1;
		for (let i=0; i<this.points.length; i++){
			fill("#0f0");
			const px = this.points[i].x * xStep + xMargin;
			const py = (this.r - this.points[i].y) * yStep;
			const d = Math.sqrt((mx - px)**2 + (my - py)**2)
			if (d < 5) this.hoveredIndex = i;
		}		
	}
}