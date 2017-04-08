# matematica
Algorítmos Humanos para as Operações Básicas das Matemática

<canvas id="myCanvas" width="800" height="800"
style="border:1px solid #d3d3d3;">
Your browser does not support the canvas element.
</canvas>

<script>
var NUMBER_WIDTH = 30;
var LINE_HEIGTH = 30;
var LINE_WIDTH_OFFSET = -5;
var LINE_HEIGTH_OFFSET = 4;
var SMALL_OFFSET = 5;

var opr = [];

var drawSigleDigit = function(digit, x, y, font) {
  ctx.font = font;
  ctx.fillText(digit, x, y);
}

var drawSigleLine = function(x1, y1, x2, y2) {
    ctx.beginPath();
	ctx.moveTo(x1,y1);
	ctx.lineTo(x2,y2);
	ctx.stroke();
}

function drawNumber(lin, col, num, small) {
	var font = ctx.font;
	if (small) {
    	ctx.font = "15px Arial";
    }
	var x = col * NUMBER_WIDTH + NUMBER_WIDTH + (small ? SMALL_OFFSET : 0);
    var y = lin * LINE_HEIGTH + LINE_HEIGTH;
    var str = "" + num;
    for (var i = 0; i<str.length; i++) {
		opr.push([drawSigleDigit,str[i], x + i * NUMBER_WIDTH, y, ctx.font]);
    }
    ctx.font = font;
}

function drawLine(lin, colFrom, colTo, operacao) {
	var x1 = colFrom * NUMBER_WIDTH + NUMBER_WIDTH;
    var y1 = lin * LINE_HEIGTH + LINE_HEIGTH;
	var x2 = colTo * NUMBER_WIDTH + NUMBER_WIDTH;
    var y2 = lin * LINE_HEIGTH + LINE_HEIGTH;
  	opr.push([drawSigleLine,x1 + LINE_WIDTH_OFFSET,y1 + LINE_HEIGTH_OFFSET,x2 + LINE_WIDTH_OFFSET,y2 + LINE_HEIGTH_OFFSET]);
  	opr.push([drawSigleDigit,operacao, x1, y1]);
}


var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.font = "30px Arial";

function drawSum(a,b) {
	if (b>a) 
    	b = [a, a = b][0];
    var sA = ''+a;
    var sB = ''+b;
    var lenA = sA.length;
    var lenB = sB.length;
	drawNumber(1,1,a);
	drawNumber(2,lenA-lenB+1,b);
	drawLine(2,0,lenA+1,"+");
    
    var dR = '0';
    for (var i=0; i<=lenA; i++) {
    	var uA = i < lenA ? sA.substring(lenA-i-1,lenA-i) : '0'; 
    	var uB = i < lenB ? sB.substring(lenB-i-1,lenB-i) : '0';
        var r = parseInt(uA) + parseInt(uB) + parseInt(dR);
        var sR = ''+r;
        var lenR = sR.length;
        var uR = sR.substring(lenR-1, lenR);
        dR = lenR == 2 ? sR.substring(0,1) : '0';
        if (i<lenA || uR != '0') 
			drawNumber(3,lenA-i,uR);
        if (dR != '0') {
			drawNumber(0,lenA-i-1,dR, true);
        }
    }
}

drawSum(999374,18158);

var step = function() {
	if (opr.length) {
		opr[0][0].apply(null,opr[0].slice(1));
    	opr = opr.slice(1);
        setTimeout(step, 200);
    }
}

step();

</script>
