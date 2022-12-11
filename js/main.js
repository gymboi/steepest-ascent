$(document).ready(function () {
    let header = $('#header');
    let buttonWrapper = $('#button-wrapper');
    let menuButton = $('#hamburger');
    let discussionButton = $('#discussion');
    let exampleButton = $('#example');
    let aboutButton = $('#about');

    menuButton.on('click', () => {
        header.toggleClass('open');
        buttonWrapper.toggleClass('open');
    });

    let tableHeaders = ['i', 'x', 'y', '<math-field class="table-header" readonly>$$ \\frac{\\partial f}{\\partial x} $$</math-field>', '<math-field class="table-header" readonly>$$ \\frac{\\partial f}{\\partial y} $$</math-field>', 'h'];
    let results = $("#results");

    let hr = $('<tr></tr>');
    tableHeaders.forEach(e => {
        hr.append($(`<th>${e}</th>`));
    });
    results.append(hr);

    // Function code
    let functionText = $("#function");
    let formula;
    functionText.on('input', (ev) => {
        formula = (ev.target.getValue());
    });

    let xd;
    $("#x-derivative").on('input', (ev) => {
        xd = (ev.target.getValue());
    });
    let yd;
    $("#y-derivative").on('input', (ev) => {
        yd = (ev.target.getValue());
    });

    const ce = new ComputeEngine.ComputeEngine();
    ce.numericMode = 'machine';

    MathLive.renderMathInDocument();

    let calculateButton = $("#calculate");

    calculateButton.on("click", () => {
        results.empty();
        hr = $('<tr></tr>');
        tableHeaders.forEach(e => {
            hr.append($(`<th>${e}</th>`));
        });
        results.append(hr);

        let iterations = [];
        console.log(iterations);
        let repetitions = $("#repetitions").val();
        console.log(repetitions);
        iterations = calculate(ce, formula, $("#x0").val(), $("#y0").val(), xd, yd, repetitions);

        //clears iterations-wrapper content
        let clearIteration = document.querySelector(".iterations-wrapper");
        clearIteration.innerHTML = "";

        //add iterations-wrapper content
        let iterationsWrapper = $(".iterations-wrapper");

        let iterationDiv = $('<div class="iteration"></div>');
        iterationsWrapper.append($('<span class="solution-title">Solution</span>'));
        for (let i = 0; i < repetitions; i++) {
            let x = iterations[i][1];
            let y = iterations[i][2];
            let xdv = iterations[i][3];
            let ydv = iterations[i][4];
            let fxy = iterations[i][5];
            let gh = iterations[i][6];
            let ghd = iterations[i][7];
            let h = iterations[i][8];

            iterationDiv.append($(`<h3 class="iteration-header">Iteration ${i + 1}:</h3>`));
            let iterationContent = $('<p class="iteration-content"></p>');

            iterationContent.append($(`<span><strong>Step 1: </strong>Get the values of the partial derivatives of x and y.<br><math-field class="solution" readonly>$$ \\frac{\\partial f}{\\partial x} $$: ${xdv}</math-field><br><math-field class="solution" readonly>$$ \\frac{\\partial f}{\\partial y} $$: ${ydv}</math-field></span>`));
            iterationContent.append($(`<span><strong>Step 2: </strong>Get the value of f(x,y).<br><math-field class="solution" readonly>f(x,y): ${fxy}</math-field></span>`));
            iterationContent.append($(`<span><strong>Step 3: </strong>Get the value of g(h) and its derivative, and compute for h.<br><math-field class="solution" readonly>g(h): ${gh}</math-field><br><math-field class="solution" readonly>g'(h): ${ghd}</math-field><br><math-field class="solution" readonly>h: ${h}</math-field></span>`));
            if (i != repetitions) {
                iterationContent.append($(`<span><strong>Step 4: </strong>Compute for the new values of x and y.<br>x: ${iterations[i+1][1]}<br>y: ${iterations[i+1][2]}</span>`));
            }
            
            let tr = $('<tr class="table-data"></tr>');
            let counter = 0;
            iterations[i].forEach(e => {
                console.log(`i = ${counter}, e=${e}`);
                if (counter != 5 && counter != 6 && counter != 7) {
                    let th = $(`<td>${e}</td>`);
                    tr.append(th);
                }
                counter++;

            });
            iterationContent.append(`<br><br>`);
            iterationDiv.append(iterationContent);
            iterationsWrapper.append(iterationDiv);
            results.append(tr);
        }
        console.log(iterations);
    });
});

// xd = x derivative
// yd = y derivative
function calculate(ce, expression, x0, y0, xd, yd, repetitions) {
    let iterations = [];
    // expression, x0, y0, xd, yd, xdv, ydv, fxy, gh, ghd, h

    let x;
    let y;

    let xdv;
    let ydv;

    let h;

    let fxy;

    let gh;
    let ghd;
    for (let i = 0; i <= repetitions; i++) {
        if (i == 0) {
            x = parseFloat(x0);
            y = parseFloat(y0);
        }
        else {
            x = x + (xdv * h);
            x = parseFloat(x.toFixed(2));

            y = y + (ydv * h);
            y = parseFloat(y.toFixed(2));
        }
        // Get partial derivative of x
        xdv = ce.parse(xd);
        xdv = xdv.subs({ x: ce.box(x), y: ce.box(y) });
        xdv = parseFloat(xdv.N().numericValue.toFixed(4));

        // Get partial derivative of y
        ydv = ce.parse(yd);
        ydv = ydv.subs({ x: ce.box(x), y: ce.box(y) });
        ydv = parseFloat(ydv.N().numericValue.toFixed(4));

        // Get function value of xy
        fxy = expression;
        fxy = fxy.replaceAll("x", `(${x}+${xdv}h)`);
        fxy = fxy.replaceAll("y", `(${y}+${ydv}h)`);
        //fxy = ce.parse(fxy);
        gh = math.rationalize(fxy).toString();
        // Derivative of gh

        ghd = nerdamer.diff(gh, 'h').toString();
        h = ce.parse(nerdamer(ghd).solveFor('h').toString()).N().numericValue;
        h = parseFloat(h.toFixed(4));
        iterations.push([i + 1, x, y, xdv, ydv, fxy, gh, ghd, h]);
        // iterations.push([i + 1, x, y, xdv, ydv, h]);
    }
    return iterations;
}

// xr = approximate root, xro = old approximate root
function calculateApproximateError(xr, xro) {
    let e = Math.abs((xr - xro) / xr) * 100;
    e = parseFloat(e.toFixed(4)) + "%";
    return e;
}