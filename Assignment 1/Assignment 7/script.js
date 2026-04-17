//<!--- JS - javascript added in HTML structure --->

let display =document.getElementById("display");

// multiple function to write - pressValue function//

function pressValue(value){
    display.value += value;
}
// claer -dispaly function //

function clearDisplay(){
    diaplay.value ="";
}
// deleteLast function //

function deleteLast(){
    display.value =display.value.slice(0, -1);
}
// calculator function show the result //

function resultcalculate() {
    try {
        displat.value= eval(display.value);
    } catch {
        display.value= "Error";
    }
}
// squareValue function //

function squareValue(){
    display.value=Math.sqrt(display.value);
}
// memoryAdd function //

function memoryAdd() {
    let value = parseFloat(document.getElementById("display").value) || 0;
    memory += value;
}
// memoryClear function //

function memoryClear(){
    memory = 0;
}
// memoryRecall function //
 
function memoryRecall() {
    document.getElementById("display").value = memory;
}

