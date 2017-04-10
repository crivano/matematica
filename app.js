var calcScale = function(w) {
    return {
        NUMBER_WIDTH: w,
        LINE_HEIGTH: w,
        LINE_WIDTH_OFFSET: -w / 6,
        LINE_HEIGTH_OFFSET: w / 8,
        SMALL_OFFSET: w / 6
    };
}

var scale = calcScale(30);

var opr = [];

var drawSigleDigit = function(digit, x, y, small) {
    if (small) {
        ctx.font = scale.NUMBER_WIDTH / 2 + "px Arial";
    } else {
        ctx.font = scale.NUMBER_WIDTH + "px Arial";
    }
    //    console.log(digit, x, y, font);
    ctx.fillText(digit, x * scale.NUMBER_WIDTH + scale.NUMBER_WIDTH + (small ? scale.SMALL_OFFSET : 0), y * scale.LINE_HEIGTH + scale.LINE_HEIGTH);
}

var drawSigleLine = function(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1 * scale.NUMBER_WIDTH + scale.NUMBER_WIDTH + scale.LINE_WIDTH_OFFSET, y1 * scale.LINE_HEIGTH + scale.LINE_HEIGTH + scale.LINE_HEIGTH_OFFSET);
    ctx.lineTo(x2 * scale.NUMBER_WIDTH + scale.NUMBER_WIDTH + scale.LINE_WIDTH_OFFSET, y2 * scale.LINE_HEIGTH + scale.LINE_HEIGTH + scale.LINE_HEIGTH_OFFSET);
    ctx.stroke();
}

var drawNumber = function(lin, col, num, small) {
    var x = col;
    var y = lin;
    var str = "" + num;
    for (var i = 0; i < str.length; i++) {
        opr.push({
            func: drawSigleDigit,
            params: [str[i], x + i, y, small],
            top: lin,
            left: col + i,
            bottom: lin,
            right: col + i
        });
    }
}

var drawLine = function(lin, colFrom, colTo, operacao) {
    var x1 = colFrom;
    var y1 = lin;
    var x2 = colTo;
    var y2 = lin;
    opr.push({
        func: drawSigleLine,
        params: [x1, y1, x2, y2],
        top: lin,
        left: colFrom,
        bottom: lin,
        right: colTo
    });
    drawNumber(lin, colFrom, operacao, false);
}


var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var initCanvas = function() {
    opr = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

var drawSum = function(a, b) {
    if (b > a)
        b = [a, a = b][0];
    var sA = '' + a;
    var sB = '' + b;
    var lenA = sA.length;
    var lenB = sB.length;
    drawNumber(1, 1, a);
    drawNumber(2, lenA - lenB + 1, b);
    drawLine(2, 0, lenA + 1, "+");

    var dR = '0';
    for (var i = 0; i <= lenA; i++) {
        var uA = i < lenA ? sA.substring(lenA - i - 1, lenA - i) : '0';
        var uB = i < lenB ? sB.substring(lenB - i - 1, lenB - i) : '0';
        var r = parseInt(uA) + parseInt(uB) + parseInt(dR);
        var sR = '' + r;
        var lenR = sR.length;
        var uR = sR.substring(lenR - 1, lenR);
        dR = lenR == 2 ? sR.substring(0, 1) : '0';
        if (i < lenA || uR != '0')
            drawNumber(3, lenA - i, uR);
        if (dR != '0') {
            drawNumber(0, lenA - i - 1, dR, true);
        }
    }
}

var calcBounds = function(opr) {
    var bounds = {
        top: opr[0].top,
        left: opr[0].left,
        bottom: opr[0].bottom,
        right: opr[0].right
    }

    for (var i = 1; i < opr.length; i++) {
        bounds.top = Math.min(opr[i].top, bounds.top);
        bounds.left = Math.min(opr[i].left, bounds.left);
        bounds.bottom = Math.max(opr[i].bottom, bounds.bottom);
        bounds.right = Math.max(opr[i].right, bounds.right);
    }
    return bounds;
}

//initCanvas();
//drawSum('99123', '8123');
//step();

var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope, $interval, $timeout) {
    $scope.operation = '+';
    $scope.a = Math.random() > 0.5 ? '2005' : '2012';
    $scope.b = '1997';

    $scope.formula = function() {
        return $scope.a + $scope.operation + $scope.b;
    }

    $scope.draw = function(a, b) {
        if ($scope.formula() == $scope.f)
            return;
        if ($scope.stop) {
            $timeout.cancel($scope.stop)
            delete $scope.stop;
        }
        $scope.f = $scope.formula();

        initCanvas();
        drawSum(parseInt(a), parseInt(b));
        if (opr.length > 0) {
            var bounds = calcBounds(opr);
            scale = calcScale(800 / (bounds.right + 2))
        }
        $scope.step();
    }

    $scope.$watch(function(scope) {
        return scope.a;
    }, function(newValue, oldValue) {
        $scope.draw($scope.a, $scope.b);
    });

    $scope.$watch('b', function(newValue, oldValue) {
        $scope.draw($scope.a, $scope.b);
    });

    $scope.step = function() {
        //  console.log("step");
        if (opr.length) {
            opr[0].func.apply(null, opr[0].params);
            opr = opr.slice(1);
            $scope.stop = $timeout($scope.step, 200);
        }
    }



});
