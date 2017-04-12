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
var dgt = [];

var CLR_TEXT = 'black';
var CLR_PROCESSING = 'goldenrod';
var CLR_NEW = 'forestgreen';

var outEraseMarks = function() {
    for (var i = 0; i < dgt.length; i++) {
        for (var j = 0; j < dgt[i].params.length; j++)
            if (dgt[i].params[j] == CLR_PROCESSING || dgt[i].params[j] == CLR_NEW)
                dgt[i].params[j] = CLR_TEXT
        dgt[i].func.apply(null, dgt[i].params);
    }
    dgt = [];
}

var drawSigleDigit = function(digit, x, y, small, color) {
    if (color !== CLR_TEXT)
        dgt.push(opr[0]);
    if (small) {
        ctx.font = scale.NUMBER_WIDTH / 2 + "px Arial";
    } else {
        ctx.font = scale.NUMBER_WIDTH + "px Arial";
    }
    ctx.fillStyle = color;
    ctx.fillText(digit, x * scale.NUMBER_WIDTH + scale.NUMBER_WIDTH + (small ? scale.SMALL_OFFSET : 0), y * scale.LINE_HEIGTH + scale.LINE_HEIGTH);
}

var drawSigleLine = function(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1 * scale.NUMBER_WIDTH + scale.NUMBER_WIDTH + scale.LINE_WIDTH_OFFSET, y1 * scale.LINE_HEIGTH + scale.LINE_HEIGTH + scale.LINE_HEIGTH_OFFSET);
    ctx.lineTo(x2 * scale.NUMBER_WIDTH + scale.NUMBER_WIDTH + scale.LINE_WIDTH_OFFSET, y2 * scale.LINE_HEIGTH + scale.LINE_HEIGTH + scale.LINE_HEIGTH_OFFSET);
    ctx.stroke();
}

var drawNumber = function(lin, col, num, small, color, timeout) {
    var x = col;
    var y = lin;
    var str = "" + num;
    for (var i = 0; i < str.length; i++) {
        opr.push({
            func: drawSigleDigit,
            params: [str[i], x + i, y, small, color],
            top: lin,
            left: col + i,
            bottom: lin,
            right: col + i,
            timeout: timeout
        });
    }
}

var drawLine = function(lin, colFrom, colTo, timeout) {
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
        right: colTo,
        timeout: timeout
    });
}

var eraseMarks = function(timeout) {
    opr.push({
        func: outEraseMarks,
        timeout: timeout
    });
}

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var initCanvas = function() {
    opr = [];
    ctx.fillStyle = CLR_TEXT;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

var drawSum = function(a, b) {
    if (b > a)
        b = [a, a = b][0];
    var sA = '' + a;
    var sB = '' + b;
    var lenA = sA.length;
    var lenB = sB.length;
    drawNumber(1, 1, a, false, CLR_TEXT, 2);
    drawNumber(2, lenA - lenB + 1, b, false, CLR_TEXT, 2);
    drawLine(2, 0, lenA + 1, 2);
    drawNumber(2, 0, "+", false, CLR_TEXT, 10);

    var dR = '0';
    for (var i = lenA; i >= 0; i--) {
        var uA = i > 0 ? sA.substring(i - 1, i) : '0';
        var uB = i > lenA - lenB ? sB.substring(i - 1, i) : '0';
        if (dR != '0')
            drawNumber(0, i, dR, true, CLR_PROCESSING, 0);
        if (i > 0 || uA != '0')
            drawNumber(1, i, uA, false, CLR_PROCESSING, 0);
        if (i > lenA - lenB || uB != '0')
            drawNumber(2, i, uB, false, CLR_PROCESSING, 10);
        var r = parseInt(uA) + parseInt(uB) + parseInt(dR);
        var sR = '' + r;
        var lenR = sR.length;
        var uR = sR.substring(lenR - 1, lenR);
        dR = lenR == 2 ? sR.substring(0, 1) : '0';
        if (i > 0 || uR != '0')
            drawNumber(3, i, uR, false, CLR_NEW, 10);
        if (dR != '0') {
            drawNumber(0, i - 1, dR, true, CLR_NEW, 10);
        }
        eraseMarks(20);
    }
}


var drawSubtraction = function(a, b) {
    if (b > a)
        b = [a, a = b][0];
    var sA = '' + a;
    var sB = '' + b;
    var lenA = sA.length;
    var lenB = sB.length;
    drawNumber(1, 1, a, false, CLR_TEXT, 2);
    drawNumber(2, lenA - lenB + 1, b, false, CLR_TEXT, 2);
    drawLine(2, 0, lenA + 1, 2);
    drawNumber(2, 0, "-", false, CLR_TEXT, 10);
    var arr = [];
    for (var i = 0; i <= lenA; i++) {
        var uA = sA.substring(lenA - i - 1, lenA - i);
        arr[i] = [];
    }

    var dR = '0';
    for (var i = 0; i < lenA; i++) {
        var uA;
        if (arr[i].length > 0) {
            uA = arr[i][arr[i].length - 1];
            drawNumber(0, lenA - i, uA, true, CLR_PROCESSING, 0);
        } else {
            uA = i < lenA ? sA.substring(lenA - i - 1, lenA - i) : '0';
            drawNumber(1, lenA - i, uA, false, CLR_PROCESSING, 0);
        }
        var uB = i < lenB ? sB.substring(lenB - i - 1, lenB - i) : '0';
        if (i < lenB || uB != '0')
            drawNumber(2, lenA - i, uB, false, CLR_PROCESSING, 10);
        var r = parseInt(uA) - parseInt(uB);
        if (r < 0) {
            r += 10;
            for (var j = i + 1;; j++) {
                drawNumber(1, lenA - j, "×", false, CLR_NEW, 10);
                var uAe = sA.substring(lenA - j - 1, lenA - j);
                var uAn;
                if (uAe != '0') {
                    uAn = (parseInt(uAe) - 1) + '';
                } else {
                    uAn = '9';
                }
                arr[j].push(i < lenA ? uAn : '0')
                drawNumber(0, lenA - j, uAn, true, CLR_NEW, 10);
                if (uAn != '9')
                    break;
            }
        }
        var sR = '' + r;
        var lenR = sR.length;
        drawNumber(3, lenA - i, sR, false, CLR_NEW, 10);
        eraseMarks(20);
    }
}

var drawMultiplication = function(a, b) {
    if (b > a)
        b = [a, a = b][0];
    var sA = '' + a;
    var sB = '' + b;
    var lenA = sA.length;
    var lenB = sB.length;
    drawNumber(1, 1, a, false, CLR_TEXT, 2);
    drawNumber(2, lenA - lenB + 1, b, false, CLR_TEXT, 2);
    drawLine(2, 0, lenA + 1, 2);
    drawNumber(2, 0, "×", false, CLR_TEXT, 10);

    var dR = '0';
    for (var i = 0; i < lenA; i++) {
        var uA = i < lenA ? sA.substring(lenA - i - 1, lenA - i) : '0';
        var uB = i < lenB ? sB.substring(lenB - i - 1, lenB - i) : '0';
        if (dR != '0')
            drawNumber(0, lenA - i, dR, true, CLR_PROCESSING, 0);
        if (i < lenA || uA != '0')
            drawNumber(1, lenA - i, uA, false, CLR_PROCESSING, 0);
        if (i < lenB || uB != '0')
            drawNumber(2, lenA - i, uB, false, CLR_PROCESSING, 10);
        var r = parseInt(uA) + parseInt(uB) + parseInt(dR);
        var sR = '' + r;
        var lenR = sR.length;
        var uR = sR.substring(lenR - 1, lenR);
        dR = lenR == 2 ? sR.substring(0, 1) : '0';
        if (i < lenA || uR != '0')
            drawNumber(3, lenA - i, uR, false, CLR_NEW, 10);
        if (dR != '0') {
            drawNumber(0, lenA - i - 1, dR, true, CLR_NEW, 10);
        }
        eraseMarks(20);
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
        if (opr[i].top === undefined || opr[i].left === undefined || opr[i].bottom === undefined || opr[i].right === undefined)
            continue;
        bounds.top = Math.min(opr[i].top, bounds.top);
        bounds.left = Math.min(opr[i].left, bounds.left);
        bounds.bottom = Math.max(opr[i].bottom, bounds.bottom);
        bounds.right = Math.max(opr[i].right, bounds.right);
    }
    return bounds;
}

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
        if ($scope.operation == "+") {
            drawSum(parseInt(a), parseInt(b));
        } else if ($scope.operation == "-") {
            drawSubtraction(parseInt(a), parseInt(b));
        } else if ($scope.operation == "×") {
            drawMultiplication(parseInt(a), parseInt(b));
        }
        if (opr.length > 0) {
            var bounds = calcBounds(opr);
            scale = calcScale(800 / (bounds.right + 2))
        }
        $scope.step();
    }

    $scope.$watch('operation', function(newValue, oldValue) {
        $scope.draw($scope.a, $scope.b);
    });

    $scope.$watch('a', function(newValue, oldValue) {
        $scope.draw($scope.a, $scope.b);
    });

    $scope.$watch('b', function(newValue, oldValue) {
        $scope.draw($scope.a, $scope.b);
    });

    $scope.step = function() {
        //  console.log("step");
        if (opr.length) {
            opr[0].func.apply(null, opr[0].params);
            $scope.stop = $timeout($scope.step, opr[0].timeout * 10);
            opr = opr.slice(1);
        }
    }



});
