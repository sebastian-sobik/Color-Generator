let isAnimating = false;


new ClipboardJS('.copy');
new ClipboardJS('.copyAPI');

const rgb2hex = (rgb) => `${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

document.querySelector(".button-generator").addEventListener("click", ()=>{
    if(!isAnimating){
        program.Generate();
    }
})

document.querySelector(".copy").addEventListener("click", ()=>{
    program.Copy();
})


//!

//wyłączenie shelter
document.querySelector(".bg-dimm").addEventListener("click", ()=>{
    view.toggleSidebar();
});

//włączenie shelter
document.querySelector(".toggle").addEventListener("click", ()=>{
    program.Toggle();
});

///!

//usunięcie klasy toggle-jump
document.querySelector(".toggle").addEventListener("animationend", ()=>{
    document.querySelector(".toggle").classList.remove("toggle-jump");
});

//usunięcie klasy pop-up-message-active
document.querySelector(".pop-up-message").addEventListener("animationend", ()=>{
    const pop_up = document.querySelector(".pop-up-message");
    pop_up.classList.remove("pop-up-message-active");
})

//aktywacja toggle-jump
document.querySelector(".add").addEventListener("click", ()=>{
    document.querySelector(".toggle").classList.add("toggle-jump");
})

//usuwanie animacji z color-block
document.querySelector(".color-block").addEventListener("animationend", ()=>{
    document.querySelector(".color-block").classList.remove("color-block-animation");
    isAnimating = false;
})



const defaultColor = "8370F4";

// !
let staticIndex = 1;
// !

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

const view = {
    isCopyToggled : false,
    isAddToggled : false,
    isSidebarToggled: false,    

    // ! do zrobienia
    deleteClrSquareAnimation(colorSquare) {

    },

    changeSquareClr(hex = defaultColor) {
        const clrSquare = document.querySelector(".color");
        clrSquare.style.backgroundColor = `#${hex}`;

    },

    changeBgClr(hex = defaultColor) {
        const body = document.querySelector("body");
        body.style.backgroundColor = `#${hex}`;
    },

    toggleCopyButton() {
        
        const leftButtonImg = document.querySelector(".icon-left img");
        
        if(this.isCopyToggled)
            leftButtonImg.setAttribute("src", "images/copy.svg");
        else 
            leftButtonImg.setAttribute("src", "images/check.svg");
        
        this.isCopyToggled = !this.isCopyToggled; 

    },

    toggleAddButton() {
        
        const rightButtonImg = document.querySelector(".icon-right img");
        
        if(this.isAddToggled){
            rightButtonImg.setAttribute("src", "images/add.svg")
        }
        else {
            rightButtonImg.setAttribute("src", "images/check.svg")
        }

        this.isAddToggled = !this.isAddToggled; 

    },

        toggleSidebarButton() {        
            const sidebarArrow = document.querySelector(".arrow-icon-toggle");
            sidebarArrow.classList.toggle("ACTIVE-arrow-icon-toggle");

            const toggle = document.querySelector(".toggle");
            toggle.classList.toggle("toggle-hidden")
        },

        toggleDimmBackground() {
            const dimmer = document.querySelector(".bg-dimm");
            dimmer.classList.toggle("bg-dimm-active");
        } ,

    toggleSidebar() {

        this.toggleSidebarButton();
        const sidebar = document.querySelector(".sidebar")
        sidebar.classList.toggle("sidebar-hidden");
        this.toggleDimmBackground();
        this.isSidebarToggled = !this.isSidebarToggled;

    },

    displayCopiedColor(hex = defaultColor) {
        
        const pop_up_color_box = document.querySelector(".pop-up-message div");
        pop_up_color_box.style.backgroundColor = `#${hex}`;

        const pop_up_span = document.querySelector(".pop-up-message span");
        pop_up_span.innerText = `#${hex}`;
        this.activatePopUp();

    },

        activatePopUp() {
            const pop_up = document.querySelector(".pop-up-message");
            pop_up.classList.add("pop-up-message-active");
        },

    loadNewColor(hex = defaultColor) {
        const colorBlock = document.querySelector(".color-block");

        this.changeBgClr(hex);
        this.changeSquareClr(hex);
        colorBlock.classList.add("color-block-animation")

    },

    updateRangeNumber(first, last) {
        const spanRange = document.querySelector(".sidebar-range");
        spanRange.innerText = `${first} - ${last}`;
    },
    
    getIsCopyToggled() {return this.isCopyToggled},
    getIsAddToggled() {return this.isAddToggled},
    getIsSidebarToggled() {return this.isSidebarToggled},

    resetButtons() {
        if(this.getIsCopyToggled()) this.toggleCopyButton();
        if(this.getIsAddToggled()) this.toggleAddButton();
    }


}

const resetObject = null;
function rgbToColorVector(rgbText) {
    let leftLim  = rgbText.indexOf("(");
    let rightLim = rgbText.indexOf(")");

    let fixedText = rgbText.slice(leftLim + 1, rightLim);

    return fixedText.split(",");
}
//TODO - to jest fragment części występującej w animacji gdy klikamy na mały blok koloru
// const dd = document.querySelector(".block-inner");
// dd.addEventListener("click", (e)=>{
//     let x = e.clientX;
//     let y = e.clientY;
//     const bgColor = e.target.style.backgroundColor;
//     let circleColorsVector = rgbToColorVector(bgColor);
    
//     circleColorsVector.forEach((element,index) => {
//         circleColorsVector[index]=element/2;
//     });
// });



const limit = 50;

const sidebarManager = {
    indexOfFirstDisplayedColor : 0, //first od dołu
    indexOfLastDisplayedColor  : 0,  //last od dołu
    blocksToAdd  : 10,
    displayLimit : limit,
    colors : [],
    
    updateIndexFirst(index = 0) {
        this.indexOfFirstDisplayedColor = index;
        view.updateRangeNumber(index+1, this.indexOfLastDisplayedColor+1);
    },
    updateIndexLast(index = 0) {
        this.indexOfLastDisplayedColor = index;
        view.updateRangeNumber(this.indexOfFirstDisplayedColor+1, index+1);
    },

    scrolledUp() {
        if(this.indexOfLastDisplayedColor < this.colors.length - 1)
        {
            const from = this.indexOfLastDisplayedColor + 1;
            const to = ((this.indexOfLastDisplayedColor + this.blocksToAdd) >= this.colors.length) 
                                                  ?  this.colors.length - 1 :  (this.indexOfLastDisplayedColor + this.blocksToAdd);
            this.addBlockUsingRange(from, to, false);
            this.updateIndexLast(to);
        }
    },

    scrolledDown() {
        if(this.indexOfFirstDisplayedColor > 0)
        {
            const from = ((this.indexOfFirstDisplayedColor - this.blocksToAdd) > 0) 
                                                  ? (this.indexOfFirstDisplayedColor - this.blocksToAdd) : 0;  

            const to = this.indexOfFirstDisplayedColor - 1;
            this.addBlockUsingRange(from, to, true);
            this.updateIndexFirst(from);
        }
    },

    addBlockUsingRange(from, to, addBEFORE = false) {
        const sidebar = document.querySelector(".scrollable-flex");
        
        if(addBEFORE)
        {
            for (let index = to; index >= from; index--) {
                const colorBlock  = this.colors[index];
                sidebar.append(colorBlock);            
            }
        }
        else {
            for (let index = from; index <= to; index++) {
                const colorBlock  = this.colors[index];
                sidebar.prepend(colorBlock);            
            }
        }

    },

    // Gdy coś dodaliśmy i było scrollowane i jest więcej niż 50 elem to jest reset na początek
    resetSidebar(){
        const sidebar = document.querySelector(".scrollable-flex") ;
        
        while(sidebar.childElementCount>0)
            sidebar.childNodes[0].remove();

        const to   =  sidebarManager.colors.length - 1;
        let from =  to - sidebarManager.displayLimit + 1;

        if(from < 0) from = 0;

        sidebarManager.updateIndexLast(to);
        sidebarManager.updateIndexFirst(from - 1);

        this.addBlockUsingRange(from, to);

    },


    // Gdy nie ma jeszcze 50 elementów i coś dodaliśmy
    updateSidebar(){
        let lastIndex = this.indexOfLastDisplayedColor;
        let newLastIndex = this.colors.length - 1;

        if(newLastIndex === 0) 
        {
            this.addBlockUsingRange(0, 0);
            sidebarManager.updateIndexLast(newLastIndex);
        }


        if(lastIndex !== newLastIndex)
        {
            this.addBlockUsingRange(lastIndex, newLastIndex);
            sidebarManager.updateIndexLast(newLastIndex);
        }

        if(sidebarManager.colors.length > sidebarManager.displayLimit)
        {
            program.moreThanDefault = true;
        }
    },

    // Gdy jest więcej niż 50 elementów i scrollowaliśmy i nie dodaliśmy niczego za pomocą ADD()
    defaultSidebar() {

        const sidebar = document.querySelector(".scrollable-flex");
        const sidebarElCount = sidebar.childElementCount;

        if(sidebarElCount > this.displayLimit){
            
            if(program.scrolledDown && !program.scrolledUp){
                for(let index = sidebarElCount ; index > this.displayLimit - 1 ; index--)
                    sidebar.firstChild.remove();

                this.updateIndexLast(this.indexOfFirstDisplayedColor + this.displayLimit - 1);
            }
            else {
                for(let index = sidebarElCount ; index > this.displayLimit - 1 ; index--)
                    sidebar.lastChild.remove();

                this.updateIndexFirst(this.indexOfFirstDisplayedColor + this.displayLimit - 1);
            }

        }

    },

    removeBlock() {

    }



}


const program = {
    mainBlockHex : defaultColor,
    userAddedColor : false,
    isScrolled : false,
    scrolledUp : false,
    scrolledDown : false,
    moreThanDefault: false,

    randomHex() {
        const digits = [0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F'];
        let hex = "";

        while ( hex.length < 6 ) {
            hex += (Math.round(Math.random() * 15)).toString(16) 
          }
          return hex.toUpperCase();
    },

    Generate() {
        const hex = this.randomHex();
        view.resetButtons();
        view.loadNewColor(hex);
        this.mainBlockHex = hex;

        //TODO      animacja buttonu
    },

    Copy() {
        if(!view.isCopyToggled){
            view.toggleCopyButton();
            view.displayCopiedColor(this.mainBlockHex);
        }
        else {
            view.toggleCopyButton();
        }
    },
    
    Add(){
        if(!view.getIsAddToggled()){
            const block = creator.createColorDiv(this.mainBlockHex);
            view.toggleAddButton();
            sidebarManager.colors.push(block);
            this.userAddedColor = true;
        }
        else{
            view.toggleAddButton();
            sidebarManager.colors.pop();
        }

    },

    CopyBlock(hex){
        const copyAPI = document.querySelector(".copyAPI");
        view.displayCopiedColor(hex);
        copyAPI.click();
    },

    Toggle() {
        if(!view.getIsSidebarToggled()){

            if(view.isAddToggled ){
                document.querySelector(".button-generator").click();
            }

            if(this.userAddedColor && !this.moreThanDefault) {sidebarManager.updateSidebar(); this.userAddedColor = false}
            else if(this.userAddedColor && this.isScrolled) {sidebarManager.resetSidebar(); this.userAddedColor = false;}
            else if(this.isScrolled) {sidebarManager.defaultSidebar(); this.isScrolled = false}

            view.toggleSidebar();
        }
    },

    scrollReset() {
        this.scrolledDown = false;
        this.scrolledUp = false;
    }

}




document.querySelector(".add").addEventListener("click", 
()=>{
    program.Add();
})


const delay = 300;
const height = 300;
const sidebar = document.querySelector(".scrollable-flex");
let scrollTopGlobal = 0;
let wait = false;

sidebar.addEventListener("scroll", (e)=>{

    const scrollTop = e.target.scrollTop;

    if(!wait){
        const scrollTopMax = e.target.scrollTopMax;
        program.scrollReset();

        if((scrollTop - scrollTopGlobal) > 0)
        {
            program.scrolledDown = true;
            if((scrollTopMax-scrollTop) < height)
            {
                program.isScrolled = true;
                sidebarManager.scrolledDown();
                wait = true;
                setTimeout(()=>{wait = false}, delay);
            }
        }
        else {
            program.scrolledUp = true;
            if(scrollTop < height)
            {
                program.isScrolled = true;
                sidebarManager.scrolledUp();
                wait = true;
                setTimeout(()=>{wait = false}, delay);
            }
        }

    }

    scrollTopGlobal = scrollTop;

})

