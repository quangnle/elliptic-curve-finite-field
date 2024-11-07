function setup() {
  createCanvas(w, h);
}

function draw() {
  background(250);
  ec.draw();
}

function mouseClicked() {
  ec.mouseClicked(mouseX, mouseY);

  if (ec.selectedIndex != -1) {
    const sgInp = document.getElementById("inpSG");
    const sg = ec.getSubGroup(ec.points[ec.selectedIndex]);
    let st = `[Order of the sub-group = ${sg.length}]:\n`;
    sg.forEach((_, idx) => {
      if (isNaN(_.x) && isNaN(_.y)) {
      st += `G x ${idx + 1} = O`;
      } else {
      st += `G x ${idx + 1} = (${_.x},${_.y}) => `;
      }
    });
    sgInp.value = st;
    
    const gTag = document.getElementById("g");
    gTag.innerHTML = `G(${ec.points[ec.selectedIndex].x},${ec.points[ec.selectedIndex].y})`;
  }
}

function mouseMoved() {
  ec.mouseMoved(mouseX, mouseY);
}