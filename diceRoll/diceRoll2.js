document.addEventListener('DOMContentLoaded', function() {
  var context = new Context(content, preloaded);
  window.app = new App(context);
  window.app.run();
});

new Context('x', 'y')

// global variables
function Context(content, preloaded) {
  return {
    diceNameArray: ['d100', 'd20', 'd12', 'd10', 'd8', 'd6', 'd4', 'd2', 'd1'],
    sumArray: [],
    sumIndex: 0,
    preloaded: preloaded,
    content: content,
    contentStatus: content.calculator,
    listeners: {},
    alert: function(message) {
      alert(message);
    },
    confirm: function(message) {
      return confirm(message);
    },
    storage: function() {
      return localStorage;
    },
    elem: function(id) {
      return document.getElementById(id);
    },
    attach: function(id, event, action) {
      var key = id + '_' + event;
      this.listeners[key] = new Listener(id, event, action, this);
    },
    detach: function(id, event) {
      var listener = this.listeners[key];
      if (listener) {
        this.listener[key].detach();
      }
    },
    style: function(id) {
      return this.elem(id).style;
    },
    html: function(id, html, append) {
      var element = this.elem(id);
      if (arguments.length === 1) {
        return element.innerHTML;
      } else {
        if (append) {
          element.innerHTML += html;
        } else {
          element.innerHTML = html;
        }
      }
    },
    eval: function(target, onerror) {
      if (onerror) {
        try {
          return eval(target);
        } catch (ex) {
          onerror(ex);
        }
      } else {
        return eval(target);
      }
    }
  };
}

function Listener(id, event, action, context) {
  this.id = id;
  this.context = context;
  this.event = 'click';
  this.action = action;
  this.exec = function() {
    return this.action();
  };
  this.detach = function() {
    this.context.elem(id).removeEventListener(this.event, this.exec.bind(this));
  };
  this.context.elem(id).addEventListener(this.event, this.exec.bind(this));
}

// data manipulation,
function Addend() {
  this.count = 0;
  this.dn = '';
  this.negative = false;
};

function App(context) {
  return {
    context: context,

    run: function() {
      this.addRollBarListeners();
      this.printToInnerHTML('calcHolder', this.context.content.calculator, true);
      this.addCalculatorListeners();
      this.simulateFirstVisit(true);
      this.checkMemory();
    },

    runSaved: function(id, rollArray) {
      var saved = JSON.parse(this.context.storage().saved);
      this.context.sumArray = saved[id].rollArray;
      this.context.sumIndex = this.context.sumArray.length - 1;
      var output = this.sumArrayToDisplay(rollArray);
      this.printToInnerHTML('dispIn', output, true);
    },

    // functions for adding listeners
    addCalculatorListeners: function() {
      this.addNumberKeyListeners();
      this.addDiceKeyListeners();
      this.addOperatorKeyListeners();
    },
    addNumberKeyListeners: function() {
      for (var i = 0; i < 10; i++) {
        var id = "num" + i;
        this.context.attach(id, 'click', this.keypadPress.bind(this, i));
      }
    },
    addDiceKeyListeners: function() {
      for (var i = 0; i < 8; i++) {
        var id = this.context.diceNameArray[i];
        this.context.attach(id, 'click', this.keypadPress.bind(this, id));
      }
    },
    addOperatorKeyListeners: function() {
      this.context.attach('num+', 'click', this.keypadPress.bind(this, '+'));
      this.context.attach('num-', 'click', this.keypadPress.bind(this, '-'));
    },
    addRollBarListeners: function() {
      this.context.attach('clrBtn', 'click', this.clearScreen.bind(this));
      this.context.attach('rollBtn', 'click', this.roll.bind(this));
      this.context.attach('savedBtn', 'click', this.toggleSaved.bind(this));
    },
    addSaveItemListeners: function() {
      var saved = JSON.parse(this.context.storage().saved);
      var saved_props = (Object.getOwnPropertyNames(saved));
      for (var i = 0; i < saved_props.length; i++) {
        var prop = saved[saved_props[i]];
        var id = prop.id;
        var rollArray = prop.rollArray;

        this.context.attach(id, 'click', this.runSaved.bind(this, id, rollArray));
        this.context.attach('mod_' + id, 'click', this.comingSoon.bind(this));
        this.context.attach('delete_' + id, 'click', this.deleteSaveItem.bind(this, id));
      }
    },

    // -- testable functions --

    // memory,
    saveItem: function(id, name, rollArray) {
      var copyOfSaved = JSON.parse(this.context.storage().saved);
      copyOfSaved[id] = {
        "id": id,
        "name": name,
        "rollArray": rollArray
      }
      this.context.storage().saved = JSON.stringify(copyOfSaved);
      this.loadMemory();
      // SaveItemListeners(copyOfSaved[id].id, copyOfSaved[id].rollArray);
      return this.copyOfSaved[id];
    },

    checkMemory: function() {
      if (this.context.storage().visited) {
        this.loadMemory();
      } else {
        this.context.storage().visited = true;
        this.restoreDefaultSaveItems();
        this.loadMemory();
      }
      return this.context.storage().visited;
    },
    loadMemory: function() {
      var savedMenu = "<div id='savedMenu'>";
      var saved = JSON.parse(this.context.storage().saved);
      var saved_props = (Object.getOwnPropertyNames(saved));
      for (var i = 0; i < saved_props.length; i++) {
        var prop = saved[saved_props[i]];
        savedMenu += "<div class='row' id='row_" + prop.id + "'>" +
          "<button class='btn saveItem col-m-8 col-t-8 col-8' id='" +
          prop.id + "'>" +
          prop.name + ": " + this.sumArrayToDisplay(prop.rollArray) +
          "</button>" +
          "<button class='btn modify saveItem col-m-2 col-t-2 col-2' id='" +
          "mod_" + prop.id + "'>" +
          "mod" +
          "</button>" +
          "<button class='btn delete saveItem col-m-2 col-t-2 col-2' id='" +
          "delete_" + prop.id + "'>" +
          "X" +
          "</button>" +
          "</div>";
      }
      savedMenu += "<button class='btn new saveItem col-m-12 col-t-12 col-12' id='newSave'>+</button></div>";

      this.context.content.savedMenu = savedMenu;
      this.context.contentStatus = savedMenu;
      return savedMenu;
    },
    restoreDefaultSaveItems: function() {
      var saved = this.context.preloaded;
      this.context.storage().saved = JSON.stringify(saved);
      return saved;
    },
    deleteSaveItem: function(id) {
      var copyOfSaved = JSON.parse(this.context.storage().saved);
      var name = copyOfSaved[id].name;
      if (this.context.confirm('Are you sure you want to delete "' + name + '"?')) {
        delete copyOfSaved[id];
        this.context.storage().saved = JSON.stringify(copyOfSaved);
        if (this.context.contentStatus === this.context.content.savedMenu) {
          this.context.style('row_' + id).display = "none";
        }
        this.loadMemory();
        return copyOfSaved;
      } else {
        return copyOfSaved;
      }
    },
    simulateFirstVisit: function() {
      this.context.storage().removeItem('visited');
      this.context.storage().removeItem('saved');
      this.context.storage().removeItem('savedMenu');
      return JSON.stringify(this.context.storage());
    },

    addendChange: function(input, targetAddend, first) {
      if (first) { targetAddend = new Addend(); }
      var output = targetAddend;
      if (this.context.diceNameArray.indexOf(input) > -1) {
        output.dn = input;
      } else if (!isNaN(input)) {
        output.count = input;
      } else if (input === '-') {
        output.negative = true;
      } else if (input === '+') {
        output.negative = false;
      }
      // console.log(output);
      return output;
    },
    addendToDisplay: function(addend) {
      var display;
      if (addend.dn === '') {
        display = addend.count;
      } else {
        display = addend.count + addend.dn;
      }
      if (addend.negative === true) {
        display = "-" + display;
      }
      // console.log(display);
      return display;
    },
    sumArrayToDisplay: function(sumArray) {
      var display = this.addendToDisplay(sumArray[0]);
      for (var i = 1; i < sumArray.length; i++) {
        if (sumArray[i].negative === false) {
          display += '+';
        }
        display += this.addendToDisplay(sumArray[i]);
      }
      return display;
    },
    addendExpand: function(addend) {
      var expanded = '';
      if (addend.dn !== '') {
        for (var i = 0; i < addend.count; i++) {
          if (!addend.negative) { expanded += '+' + addend.dn; }
          else { expanded += '-' + addend.dn; }
        }
      } else {
        expanded = addend.count;
        if (!addend.negative) { expanded = '+' + expanded; }
        else { expanded = '-' + expanded; }
      }
      return expanded;
    },
    sumArrayExpand: function(sumArray) {
      var expanded = '';
      for (var i = 0; i < sumArray.length; i++) {
        expanded += this.addendExpand(sumArray[i]);
      }
      if (expanded.indexOf('+') === 0) { expanded = expanded.slice(1); }
      return expanded;
    },
    randomIntByDice: function(dn) {
      var numberOfSides = dn.replace('d', '');
      var randomInt = Math.floor((Math.random() * numberOfSides) + 1);
      return randomInt;
    },
    subRandomIntForDice: function(str) {
      for (var i = 0; i < this.context.diceNameArray.length; i++) {
        var currentDice = this.context.diceNameArray[i];
        for (var t = true; t !== false; t = str.includes(currentDice)) {
          str = str.replace(currentDice, '(' + this.randomIntByDice(currentDice) + ')');
        }
      }
      return str;
    },

    // functions for displaying data,
    toggleSaved: function() {
      if (this.context.contentStatus === this.context.content.calculator) {
        this.printToInnerHTML('calcHolder', this.context.content.savedMenu, true);
        this.printToInnerHTML('savedBtn', 'calc', true);

        //TODO: every time you toggle you are adding new listeners - could cause memory leaks. detach if destroying elements
        this.addSaveItemListeners();
        this.context.content.savedMenu = this.context.html('calcHolder');
        this.context.contentStatus = this.context.content.savedMenu;
      } else if (this.context.contentStatus === this.context.content.savedMenu) {
        this.printToInnerHTML('calcHolder', this.context.content.calculator, true);
        this.printToInnerHTML('savedBtn', 'saved', true);
        this.addCalculatorListeners();
        this.context.contentStatus = this.context.content.calculator;
      }
      return this.context.contentStatus;
    },
    printToInnerHTML: function(id, str, replaceTF) {
      if (replaceTF !== true) {
        this.context.html(id, str, true);
      } else {
        this.context.html(id, str);
      }
      return str;
    },
    clearScreen: function(override) {
      if (this.context.html('dispIn') === '' || override === 'dispOut') {
        this.printToInnerHTML('dispOut', '', true);
        this.clearSumArray();
      } else if (this.context.html('dispIn').innerHTML !== '' || override === 'dispIn') {
        this.printToInnerHTML('dispIn', '', true);
        this.clearSumArray();
      }
      return '';
    },
    clearSumArray: function() {
      this.context.sumIndex = 0;
      this.context.sumArray.length = 0;
      var testOutput = [this.context.sumArray.length, this.context.sumIndex];
      return testOutput.toString();
    },

    // main,
    keypadPress: function(input, testTF) {
      // if sumArray is empty
      if (this.context.sumArray.length === 0) {
        this.context.sumArray[this.context.sumIndex] = this.addendChange(input, this.context.sumArray[this.context.sumIndex], true);
        if (this.context.diceNameArray.indexOf(input) > -1) { this.context.sumArray[0].count++; }
        // else if input is a dice...
      } else if (this.context.diceNameArray.indexOf(input) > -1) {
        // ...and input is not the same dice as current addend dice
        if (input !== this.context.sumArray[this.context.sumIndex].dn && '' !== this.context.sumArray[this.context.sumIndex].dn) {
          this.context.sumIndex++;
          this.context.sumArray[this.context.sumIndex] = this.addendChange(input, this.context.sumArray[this.context.sumIndex], true);
          this.context.sumArray[this.context.sumIndex].count++;
          // ...and input is the same as current addend dice
        } else if (input === this.context.sumArray[this.context.sumIndex].dn) {
          this.context.sumArray[this.context.sumIndex].count++;
          // ...and current addend has a count, but no dice
        } else if (0 !== this.context.sumArray[this.context.sumIndex].count) {
          this.context.sumArray[this.context.sumIndex] = this.addendChange(input, this.context.sumArray[this.context.sumIndex], false);
          // ...and current addend has no count, and no dice
        } else if (0 === this.context.sumArray[this.context.sumIndex].count) {
          this.context.sumArray[this.context.sumIndex] = this.addendChange(input, this.context.sumArray[this.context.sumIndex], false);
          this.context.sumArray[this.context.sumIndex].count++;
        }
        // else if input is a number...
      } else if (!isNaN(input)) {
        // ...and current addend has dice
        if ('' !== this.context.sumArray[this.context.sumIndex].dn) {
          this.context.sumIndex++;
          this.context.sumArray[this.context.sumIndex] = this.addendChange(input, this.context.sumArray[this.context.sumIndex], true);
          // ...and current addend has no dice
        } else if ('' === this.context.sumArray[this.context.sumIndex].dn) {
          this.context.sumArray[this.context.sumIndex].count = (10 * parseInt(this.context.sumArray[this.context.sumIndex].count)) + parseInt(input);
        }
        // else if input is + or - sign...
      } else if (input === '+' || input === '-') {
        this.context.sumIndex++;
        this.context.sumArray[this.context.sumIndex] = this.addendChange(input, this.context.sumArray[this.context.sumIndex], true);
      }
      // console.log(this.context.sumArray);
      var output = this.sumArrayToDisplay(this.context.sumArray);
      this.printToInnerHTML('dispIn', output, true);

      if (!testTF) { return output; }//TODO: remove?

      var testOut = this.addendToDisplay(this.context.sumArray[this.context.sumIndex]);
      return testOut;
    },
    roll: function() {
      var sumArray = this.context.sumArray;
      var equation = this.sumArrayExpand(sumArray);
      equation = this.subRandomIntForDice(equation);
      var evaluation = this.context.eval(equation);
      var output = evaluation + ' [' + equation + '] ' + '<br><br>' + this.context.html('dispOut');
      this.printToInnerHTML('dispOut', output, true);
      return output;
    },

    comingSoon: function() {
      this.context.alert('this feature is coming soon!');
    }
  };
}