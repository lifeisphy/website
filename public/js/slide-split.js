// 1. Split content at headings
function splitContentByHeading(contentDiv) {
    const nodes = Array.from(contentDiv.childNodes);
    let slides = [], current = [];
    nodes.forEach(node => {
    if (node.nodeType === 1 && /^H[1-6]$/.test(node.tagName)) {
        if (current.length > 0){
        slides.push(current);
        current = [node];
        } else{
        current = [node];
        }
    } else {
        current.push(node);
    }
    });
    if (current.length) slides.push(current);
    return slides;
}

// 2. Further split if slide overflows screen
function splitSlidesByHeight(slides, maxHeight) {
    const temp = document.createElement('div');
    temp.className = 'reveal slides';
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    // temp.style.width = '80vw';
    temp.style.padding = '0px';
    document.body.appendChild(temp);

    let finalSlides = [];
    slides.forEach(nodes => {
    temp.innerHTML = '';
    nodes.forEach(n => temp.appendChild(n.cloneNode(true)));
    if (temp.scrollHeight <= maxHeight) {
        finalSlides.push(nodes);
    } else {
        // Try to split at paragraphs
        let sub = [];
        nodes.forEach(n => {
        temp.innerHTML = '';
        sub.forEach(sn => temp.appendChild(sn.cloneNode(true)));
        temp.appendChild(n.cloneNode(true));
        if (temp.scrollHeight > maxHeight) {
            console.log(`${temp.scrollHeight} > ${maxHeight}, forcing split at single node`);
            if (sub.length === 0) {
            // 单个节点就超高，强制分页
            finalSlides.push([n]);
            sub = [];
            } else {
                
            finalSlides.push(sub);
            sub = [n];
            }
        } else {
            sub.push(n);
        }
        });
        if (sub.length) finalSlides.push(sub);
    }
    });
    document.body.removeChild(temp);
    return finalSlides;
}

// 3. Render slides
function renderSlides(slides) {
    const slidesDiv = document.getElementById('slides');
    slidesDiv.innerHTML = '';
    slides.forEach((nodes, idx) => {
    const slide = document.createElement('section');
    slide.className = 'slides';
    nodes.forEach(n => slide.appendChild(n.cloneNode(true)));
    slidesDiv.appendChild(slide);
    });
}

