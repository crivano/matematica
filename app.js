var calcScale = function(bounds) {
    var w = 800 / (bounds.right - bounds.left + 2);
    return {
        X_OFFSET: -bounds.left * w,
        Y_OFFSET: -bounds.top * w,
        NUMBER_WIDTH: w,
        LINE_HEIGTH: w,
        LINE_WIDTH_OFFSET: -w / 6,
        LINE_HEIGTH_OFFSET: w / 8,
        SMALL_X_OFFSET: w / 6,
        SMALL_Y_OFFSET: w / 6
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
    ctx.fillText(digit, x * scale.NUMBER_WIDTH + scale.NUMBER_WIDTH + scale.X_OFFSET + (small ? scale.SMALL_X_OFFSET : 0), get(y).offset * scale.LINE_HEIGTH + (small ? scale.SMALL_Y_OFFSET : 0));
}

var drawSigleLine = function(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1 * scale.NUMBER_WIDTH + scale.NUMBER_WIDTH + scale.X_OFFSET + scale.LINE_WIDTH_OFFSET, get(y1).offset * scale.LINE_HEIGTH + scale.LINE_HEIGTH_OFFSET);
    ctx.lineTo(x2 * scale.NUMBER_WIDTH + scale.NUMBER_WIDTH + scale.X_OFFSET + scale.LINE_WIDTH_OFFSET, get(y1).offset * scale.LINE_HEIGTH + scale.LINE_HEIGTH_OFFSET);
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
    arr = [];
    dgt = [];
    ctx.fillStyle = CLR_TEXT;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function charIsNumeric(c) {
    return !isNaN(parseInt(c, 10));
}

var arr = [];
var set = function(l, c, p, v) {
    var o = get(l, c);
    if (p == 'val')
        if (charIsNumeric(v)) {
            v = parseInt(v);
        } else {
            o[p] = undefined;
            return;
        }
    o[p] = v;
    return o;
}

var get = function(l, c) {
    var i = l + ',' + c;
    arr[i] = arr[i] || {};
    return arr[i];
}
var getVal = function(l, c) {
    var v = get(l, c).val;
    if (v !== undefined)
        write(l, c, v, get(l).small, 0, CLR_PROCESSING);
    return v;
}
var write = function(lin, col, num, small, timeout, color) {
    var str = "" + num;
    set(lin, undefined, 'small', small);
    for (var i = 0; i < str.length; i++) {
        var o = set(lin, str.length - i - 1 + col, 'val', str[i]);
        opr.push({
            func: drawSigleDigit,
            params: [str[i], -col + i - str.length - 1, lin, small, color || CLR_NEW],
            top: lin,
            left: -col + i - str.length - 1,
            bottom: lin,
            right: -col + i - str.length - 1,
            timeout: timeout || 0
        });
    }
}

var line = function(lin, colFrom, colWidth, timeout) {
    opr.push({
        func: drawSigleLine,
        params: [-colFrom - 1, lin, -colFrom - colWidth - 1, lin],
        top: lin,
        left: -colFrom - colWidth - 1,
        bottom: lin,
        right: -colFrom - 1,
        timeout: timeout
    });
}

var calcLineHeights = function(bounds) {
    var t = 0;
    for (var i = bounds.top; i <= bounds.bottom; i++) {
        var o = get(i);
        var h = 0;
        if (o.hasOwnProperty('small')) {
            h = o.small ? 0.5 : 1;
        }
        o.heigth = h;
        t += h;
        o.offset = t;
    }
}

var doNothing = function() {};

var pause = function(timeout) {
    opr.push({
        func: doNothing,
        params: [],
        timeout: timeout
    });
}


var drawSum = function(a, b) {
    if (b > a)
        b = [a, a = b][0];
    var lenA = ('' + a).length;
    write(1, 0, a, false, 2, CLR_TEXT);
    write(2, 0, b, false, 2, CLR_TEXT);
    line(2, 0, lenA + 1, 2);
    write(2, lenA, "+", false, 2, CLR_TEXT);
    pause(20);

    for (var i = 0; i <= lenA; i++) {
        var uR = getVal(0, i);
        var uA = getVal(1, i);
        var uB = getVal(2, i);
        pause(10);
        var r = (uA || 0) + (uB || 0) + (uR || 0);
        var uR = r % 10;
        var dR = (r - uR) / 10;
        if (i < lenA || uR != 0)
            write(3, i, uR, false, 10);
        if (dR != 0)
            write(0, i + 1, dR, true, 10);
        eraseMarks(20);
    }
}

var drawSubtraction = function(a, b) {
    if (b > a)
        b = [a, a = b][0];
    var lenA = ('' + a).length;
    write(1, 0, a, false, 2, CLR_TEXT);
    write(2, 0, b, false, 2, CLR_TEXT);
    line(2, 0, lenA + 1, 2);
    write(2, lenA, "-", false, 2, CLR_TEXT);
    pause(20);

    for (var i = 0; i <= lenA; i++) {
        var uR = getVal(0, i);
        var uA = getVal(1, i);
        var uB = getVal(2, i);
        pause(10);
        var r = (uA || 0) + (uR || 0) - (uB || 0);
        if (r < 0) {
            r += 10;
            for (var j = i + 1;; j++) {
                var e = getVal(1, j);
                write(1, j, "×", false, 10);
                if (e > 0) {
                    write(0, j, e - 1, 10);
                    break;
                } else {
                    write(0, j, 9, 10);
                }
            }
        }
        var uR = r % 10;
        if (i < lenA || uR != 0)
            write(3, i, uR, false, 10);
        eraseMarks(20);
    }
}


var drawMultiplication = function(a, b) {
    if (b > a)
        b = [a, a = b][0];
    var lenA = ('' + a).length;
    var lenB = ('' + b).length;
    write(1, 0, a, false, 2, CLR_TEXT);
    write(2, 0, b, false, 2, CLR_TEXT);
    line(2, 0, lenA + 1, 2);
    write(2, lenA, "×", false, 2, CLR_TEXT);
    pause(20);

    for (var iB = 0; iB < lenB; iB++) {
        for (var i = 0; i < lenA; i++) {
            var uR = getVal(0 - iB, i);
            var uB = getVal(2, iB);
            var uA = getVal(1, i);
            var r = uA * uB + (uR || 0);
            if (i == lenA - 1)
                write(4 + iB, i + iB, r, false, 10);
            else {
                var uR = r % 10;
                var dR = (r - uR) / 10;
                if (i < lenA || uR != 0)
                    write(4 + iB, i + iB, uR, false, 10);
                if (dR != 0)
                    write(0 - iB, i + 1, dR, true, 10);
            }
            eraseMarks(20);
        }
    }

    lenSum = lenB;
    while (get(3 + lenB, lenSum).hasOwnProperty('val'))
        lenSum++;
    line(3 + lenB, 0, lenSum + 1, 2);
    write(3 + lenB, lenSum, "+", false, 2, CLR_TEXT);
    pause(20);

    for (var i = 0; i <= lenSum; i++) {
        var uR = getVal(3, i);
        var r = (uR || 0);
        for (var iB = 0; iB < lenB; iB++) {
            var uB = getVal(4 + iB, i);
            r += (uB || 0);
        }
        pause(10);
        var uR = r % 10;
        var dR = (r - uR) / 10;
        if (i < lenSum || uR != 0)
            write(4 + lenB, i, uR, false, 10);
        if (dR != 0)
            write(3, i + 1, dR, true, 10);
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
            drawMultiplication(parseInt(a), parseInt(b));
        } else if ($scope.operation == "-") {
            drawSubtraction(parseInt(a), parseInt(b));
        } else if ($scope.operation == "×") {
            drawMultiplication(parseInt(a), parseInt(b));
        }
        if (opr.length > 0) {
            var bounds = calcBounds(opr);
            calcLineHeights(bounds);
            console.log(arr);
            scale = calcScale(bounds);
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
            $scope.stop = $timeout($scope.step, opr[0].timeout * 0);
            opr = opr.slice(1);
        }
    }



});
