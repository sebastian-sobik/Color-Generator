new ClipboardJS('.copy');
new ClipboardJS('.copyAPI');

import {defaultColor, limit, delay, height} from './defaultValues.js';

if(window.matchMedia('screen and (min-width: 1280px)').matches){
    limit = 70;
}

let scrollTopGlobal = 0;
let wait = false;
let isAnimating = false;


const creator = {  
    
    createColorDiv(hex = defaultColor) {

        const outer = document.createElement("div");
        const removal = this.createRemoval();
        const inner = this.createInner(hex)

        outer.classList.add("block-outer");
        
        inner.append(removal);
        outer.append(inner);

        inner.addEventListener("click",(el)=>{
            const blockHex =  rgb2hex(el.target.style.backgroundColor).toUpperCase();
            program.CopyBlock(blockHex);
        })

        ClickAndHold.apply(outer, ()=>{
            outer.remove();
            sidebarManager.colors[sidebarManager.colors.indexOf(outer)] = null;
            program.deletedItems++;
            if(program.deletedItems==3)
                view.toggleTrash();

          })

        return outer;
        
    },

    createRemoval() {
        const removal = document.createElement("div");
        removal.classList.add("removal-block");

        return removal;
    },

    createInner(hex){
        const inner = document.createElement("div");
        inner.classList.add("block-inner");
        inner.style.backgroundColor = `#${hex}`;

        return inner;
    },


}


const view = {
    isCopyToggled : false,
    isAddToggled : false,
    isSidebarToggled: false,  
    isTrashToggled: false,  


    changeSquareClr(hex = defaultColor) {
        const clrSquare = document.querySelector(".color");
        clrSquare.style.backgroundColor = `#${hex}`;
    },

    changeBgClr(hex = defaultColor) {
        const body = document.querySelector("body");
        body.style.backgroundColor = `#${hex}`;
    },

    toggleCopyButton() {
        
        const leftButtonImg = document.querySelector(".copy div");

        ["fa-check", "fa-solid", "fa-copy"].forEach(element => { leftButtonImg.classList.toggle(element); });

        this.isCopyToggled = !this.isCopyToggled; 

    },

    toggleAddButton() {
        
        const rightButtonImg = document.querySelector(".add div");
        
        ["fa-check", "fa-solid", "fa-plus"].forEach(element => { rightButtonImg.classList.toggle(element); });

        this.isAddToggled = !this.isAddToggled; 

    },

    toggleSidebar() {

        const sidebar = document.querySelector(".sidebar")

        this.toggleSidebarButton();
        sidebar.classList.toggle("sidebar-hidden");
        this.toggleDimmBackground();
        this.isSidebarToggled = !this.isSidebarToggled;

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

    toggleTrash(){
        const trash = document.querySelector(".trash");
        trash.classList.toggle("trash-hidden");
        this.isTrashToggled = !this.isTrashToggled;
    },
    
    getIsCopyToggled() {return this.isCopyToggled},
    getIsAddToggled() {return this.isAddToggled},
    getIsSidebarToggled() {return this.isSidebarToggled},

    resetButtons() {
        if(this.getIsCopyToggled()) this.toggleCopyButton();
        if(this.getIsAddToggled()) this.toggleAddButton();
    },

}


const sidebarManager = {
    indexOfFirstDisplayedColor : 0, 
    indexOfLastDisplayedColor  : 0,  
    blocksToAdd  : 5,
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
                if(colorBlock != null)
                    sidebar.append(colorBlock);            
            }
        }
        else {
            for (let index = from; index <= to; index++) {
                const colorBlock  = this.colors[index];
                if(colorBlock != null)
                    sidebar.prepend(colorBlock);            
            }
        }

    },

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
        else{
            program.moreThanDefault = false;
        }
    },

    defaultSidebar() {

        const sidebar = document.querySelector(".scrollable-flex");
        const sidebarElCount = sidebar.childElementCount;

        //! console.log(program.scrolledDown, "   ", program.scrolledUp);

        if(sidebarElCount > this.displayLimit){
            
            if(program.scrolledDown){
                for(let index = sidebarElCount ; index > this.displayLimit - 1 ; index--)
                    sidebar.firstChild.remove();

                this.updateIndexLast(this.indexOfFirstDisplayedColor + this.displayLimit - 1);
            }
            else {
                for(let index = sidebarElCount ; index > this.displayLimit - 1 ; index--)
                    sidebar.lastChild.remove();

                this.updateIndexFirst(this.indexOfLastDisplayedColor - this.displayLimit);
            }

        }

    },



}


const program = {
    mainBlockHex : defaultColor,
    userAddedColor : false,
    isScrolled : false,
    scrolledUp : false,
    scrolledDown : false,
    moreThanDefault: false,
    deletedItems: 0,
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
            this.userAddedColor = false;
        }

    },

    CopyBlock(hex){
        const copyAPI = document.querySelector(".copyAPI");
        view.displayCopiedColor(hex);
        copyAPI.click();
    },

    Toggle() {
        if(!view.getIsSidebarToggled()){

            if(view.isAddToggled){
                document.querySelector(".button-generator").click();
            }

            if(this.userAddedColor && !this.moreThanDefault) {sidebarManager.updateSidebar(); this.userAddedColor = false}
            else if(this.userAddedColor && this.isScrolled) {sidebarManager.resetSidebar(); this.userAddedColor = false;}
            else if(this.isScrolled) {sidebarManager.defaultSidebar(); this.isScrolled = false}
            else if(sidebarManager.colors.length > 0) {sidebarManager.updateSidebar()}

            view.toggleSidebar();
        }
            
    },

    scrollReset() {
        this.scrolledDown = false;
        this.scrolledUp = false;
        this.isScrolled = false;
    }

}


const listeners = {
    WindowListeners(){

        const isOnIOS = navigator.userAgent.match(/iPad/i)|| navigator.userAgent.match(/iPhone/i);
        const eventName = isOnIOS ? "pagehide" : "beforeunload";

        window.addEventListener(eventName, function(){

            localStorage.setItem("colors", JSON.stringify(allColors()) || []);
            sessionStorage.setItem("colorNow", program.mainBlockHex);
        
        }, false);
    
        window.addEventListener("load", function(){
        
            const colors = JSON.parse(localStorage.getItem("colors"));
        
            colors.forEach(element => {
                const object = creator.createColorDiv(element);
                sidebarManager.colors.push(object);
            });
        
            const savedHex = sessionStorage.getItem("colorNow");
            if(savedHex){
                view.loadNewColor(savedHex);
                program.mainBlockHex = savedHex;
            }
        },false)

        window.addEventListener("keydown", (e)=>{
            console.log(e.code);
            if(!isAnimating && e.code === "Space"){
                program.Generate();
                this.isAnimating = true;
            }
            else if(e.code === "KeyA")
            {
                program.Add();
                document.querySelector(".toggle").classList.add("toggle-jump");
            }
            else if(e.code === "KeyC")
            {
                program.Copy();
            }
        });


    },

    CopyListeners(){

        const copyButton = document.querySelector(".copy")

        copyButton.addEventListener("click", ()=>{
            program.Copy();
        });
        
    },

    GeneratorListeners(){

        const buttonGenerator = document.querySelector(".button-generator");

        buttonGenerator.addEventListener("click", ()=>{
            if(!isAnimating){
                program.Generate();
                this.isAnimating = true;
            }
        });

    },

    BackgroundListeners(){
        const background = document.querySelector(".bg-dimm");

        background.addEventListener("click", ()=>{
            view.toggleSidebar();
            program.deletedItems = 0;
            if(view.isTrashToggled)
            {
                view.toggleTrash();
            }
        });
    },

    ToggleListeners(){
        const toggle = document.querySelector(".toggle");

        toggle.addEventListener("click", ()=>{
            program.Toggle();
        });

        toggle.addEventListener("animationend", ()=>{
            toggle.classList.remove("toggle-jump");
        });
    },

    PopUpListeners(){
        const popUp = document.querySelector(".pop-up-message");

        popUp.addEventListener("animationend", ()=>{
            popUp.classList.remove("pop-up-message-active");
        });
    },

    AddListeners(){
        const add = document.querySelector(".add");

        add.addEventListener("click", ()=>{
            document.querySelector(".toggle").classList.add("toggle-jump");
        });

        add.addEventListener("click", ()=>{
            program.Add();
        })
    },

    ColorBlockListeners(){
        const colorBlock = document.querySelector(".color-block");
        
        colorBlock.addEventListener("animationend", ()=>{
            colorBlock.classList.remove("color-block-animation");
            isAnimating = false;
        });
    },

    SidebarListeners(){
        const sidebar = document.querySelector(".scrollable-flex");
        
        sidebar.addEventListener("scroll", (e)=>{
            
            const scrollTop = e.target.scrollTop;
            const scrollTopMax = e.target.scrollHeight;
        
            if(!wait){

                program.isScrolled = false;

                if((scrollTop - scrollTopGlobal) > 0)
                {
                    //scrolling down

                    program.scrolledUp = false;
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
                    //scrolling up

                    program.scrolledUp = true;
                    program.scrolledDown = false;
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
    },

    TrashListeners(){
        const trash = document.querySelector(".trash");

        trash.addEventListener("click", ()=>{
            const sidebar = document.querySelector(".scrollable-flex");

            localStorage.clear();
            sidebarManager.colors = [];

            while(sidebar.firstChild){
                sidebar.removeChild(sidebar.lastChild);
            }
        })
    },

    ApplyListeners(){
        for (const key in this)
        { 
            if(key === "ApplyListeners")
                continue;
            this[key]();
        } 
    },

}


class ClickAndHold {

    constructor(target, callback) {
        this.target = target;
        this.callback = callback;
        this.isHeld = false;
        this.activeHoldTimeoutId = null;

        ["mousedown", "touchstart"].forEach(type => {
            this.target.addEventListener(type, this._onHoldStart.bind(this)); //!
        });
 
        ["mouseup", "mouseleave", "mouseout", "touchend", "touchcancel"].forEach(type => {
            this.target.addEventListener(type, this._onHoldEnd.bind(this)); //!
        });
    }

    _onHoldStart() {
        this.isHeld = true;

        this.target.firstChild.firstChild.classList.add("animation-removal");

        this.activeHoldTimeoutId = setTimeout(()=>{
            if(this.isHeld){
                this.callback();
            }
        },450)
    }

    _onHoldEnd() {
        this.target.firstChild.firstChild.classList.remove("animation-removal");

        this.isHeld = false;
        clearTimeout(this.activeHoldTimeoutId);
    }

    static apply(target, callback) {
        new ClickAndHold(target, callback);
    }

}


function allColors() {
    const colors = [];
    const sidebarManagerColorBlocks = sidebarManager.colors;

    sidebarManagerColorBlocks.forEach(element => {
        if(element != null) 
            colors.push(rgb2hex(element.firstChild.style.backgroundColor));
    });

    return colors;
}


const rgb2hex = (rgb) => `${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`


listeners.ApplyListeners();

