const creator = {
    createColorDiv(hex = defaultColor) {

        const outer = document.createElement("div");
        outer.classList.add("block-outer");

        const inner = document.createElement("div");
        inner.classList.add("block-inner");

        inner.style.backgroundColor = `#${hex}`;
        outer.append(inner);

        inner.addEventListener("click",(el)=>{
            const blockHex =  rgb2hex(el.target.style.backgroundColor).toUpperCase();
            program.CopyBlock(blockHex);
        })

        // !
        inner.innerText = staticIndex++;
        // !

        return outer;
        
    },

}