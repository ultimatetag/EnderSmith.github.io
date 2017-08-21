document.addEventListener('DOMContentLoaded', function() {
  runTests(true);
});
var testGlobals = {
  sumArray: [
    {
      count: 4,
      dn: 'd6',
      negative: false,
      display: '4d6',
      expanded: '+d6+d6+d6+d6'
    },
    {
      count: 2,
      dn: 'd12',
      negative: true,
      display: '-2d12',
      expanded: '-d12-d12'
    },
    {
      count: 2,
      dn: '',
      negative: true,
      display: '-2',
      expanded: '-2'
    }
  ],
  sumArray_display: '4d6-2d12-2',
  sumArray_expanded: 'd6+d6+d6+d6-d12-d12-2',
}

function runTests(runTF) {
  if (runTF === true) {

    var passFail = [
      new UnitTest('MEMORY FUNCTION TEST: simulateFirstVisit()', function(app, test) {
        test.report = app.simulateFirstVisit(true);
        return test.report === '{}';
      }),
      new UnitTest('MEMORY FUNCTION TEST: checkMemory()', function(app, test) {
        return (app.checkMemory() === "true");
      }),
      new UnitTest('MEMORY FUNCTION TEST: new SaveItem()', function(app, test) {
        var saveItem = app.saveItem('test_id', 'test_name', ['test', 'array']);
        saveItem = JSON.stringify(saveItem);
        var localSaveItem = app.context.storage().saved;
        return (localSaveItem.includes(saveItem));
      }),
      new UnitTest('MEMORY FUNCTION TEST: loadMemory()', function(app, test) {
        var savedMenu = app.loadMemory();
        return (app.context.content.savedMenu.includes(savedMenu));
      }),
      new UnitTest('MEMORY FUNCTION TEST: deleteSaveItem()', function(app, test) {
        return !('test_id' in app.deleteSaveItem('test_id', true));
      }),
      new UnitTest('MEMORY FUNCTION TEST: restoreDefaultSaveItems()', function(app, test) {
        var saved = app.restoreDefaultSaveItems();
        saved = JSON.stringify(saved);
        return (saved === app.context.storage().saved);
      }),

      new UnitTest('DATA FUNCTION TEST: new Addend()', function(app, test) {
        var blankAddend = new Addend();
        var pass = true;
        if (blankAddend.count !== 0) {
          pass = false;
        }
        if (blankAddend.dn !== '') {
          pass = false;
        }
        if (blankAddend.negative !== false) {
          pass = false;
        }
        return pass;
      }),
      new UnitTest('DATA FUNCTION TEST: addendChange()', function(app, test) {
        var pass = true;
        var workingAddend = app.addendChange('d4', '', true);
        if (workingAddend.dn !== 'd4') {
          pass = false;
        }
        workingAddend = app.addendChange(4, workingAddend);
        if (workingAddend.count !== 4) {
          pass = false;
        }
        workingAddend = app.addendChange('-', workingAddend);
        if (workingAddend.negative !== true) {
          pass = false;
        }
        workingAddend = app.addendChange('+', workingAddend);
        if (workingAddend.negative !== false) {
          pass = false;
        }
        return pass;
      }),
      new UnitTest('DATA FUNCTION TEST: addendToDisplay()', function(app, test) {
        var pass = true;
        if (app.addendToDisplay(testGlobals.sumArray[0]) !== testGlobals.sumArray[0].display) {
          pass = false;
        }
        if (app.addendToDisplay(testGlobals.sumArray[1]) !== testGlobals.sumArray[1].display) {
          pass = false;
        }
        if (app.addendToDisplay(testGlobals.sumArray[2]) !== testGlobals.sumArray[2].display) {
          pass = false;
        }
        return pass;
      }),
      new UnitTest('DATA FUNCTION TEST: sumArrayToDisplay()', function(app, test) {
        return (app.sumArrayToDisplay(testGlobals.sumArray) === testGlobals.sumArray_display);
      }),
      new UnitTest('DATA FUNCTION TEST: addendExpand()', function(app, test) {
        var pass = true;
        if (app.addendExpand(testGlobals.sumArray[0]) !== testGlobals.sumArray[0].expanded) {
          pass = false;
        }
        if (app.addendExpand(testGlobals.sumArray[1]) !== testGlobals.sumArray[1].expanded) {
          pass = false;
        }
        if (app.addendExpand(testGlobals.sumArray[2]) !== testGlobals.sumArray[2].expanded) {
          pass = false;
        }
        return pass;
      }),
      new UnitTest('DATA FUNCTION TEST: sumArrayExpand()', function(app, test) {
        return (app.sumArrayExpand(testGlobals.sumArray) === testGlobals.sumArray_expanded);
      }),
      new UnitTest('DATA FUNCTION TEST: randomIntByDice()', function(app, test) {
        var pass = true;
        for (var i = 1; i <= 20; i++) {
          var randomInt = app.randomIntByDice('d' + i);
          if ( 0 < randomInt && randomInt > i) {
            pass = false;
          }
        }
        return pass;
      }),
      new UnitTest('DATA FUNCTION TEST: subRandomIntForDice()', function(app, test) {
        return !(app.subRandomIntForDice(testGlobals.sumArray_expanded).includes('d'));
      }),

      new UnitTest('DISPLAY FUNCTION TEST: toggleSaved()', function(app, test) {
        var result;
        if (app.context.contentStatus === content.calculator) {
          result = (app.toggleSaved() === content.savedMenu);
        } else if (app.context.contentStatus === content.savedMenu) {
          result = (app.toggleSaved() === content.calculator);
        }
        if (result === true) {
          app.toggleSaved();
        }
        return result;
      }),
      new UnitTest('DISPLAY FUNCTION TEST: printToInnerHTML()', function(app, test) {
        var replacePass = true;
        var addonPass = true;
        document.getElementById('dispIn').innerHTML = 'init';
        if (app.printToInnerHTML('dispIn', 'replaced', true) !== document.getElementById('dispIn').innerHTML) {
          replacePass = false;
        }
        if ('replaced' + app.printToInnerHTML('dispIn', ' added on') !== document.getElementById('dispIn').innerHTML) {
          addonPass = false;
        }
        return (replacePass && addonPass);
      }),
      new UnitTest('DISPLAY FUNCTION TEST: clearScreen()', function(app, test) {
        var clearIn = true;
        var clearOut = true;
        document.getElementById('dispIn').innerHTML = 'not clear in';
        document.getElementById('dispOut').innerHTML = 'not clear out';
        if (app.clearScreen() !== document.getElementById('dispIn').innerHTML) {
          clearIn = false;
        }
        if (app.clearScreen() !== document.getElementById('dispOut').innerHTML) {
          clearOut = false;
        }
        return (clearIn && clearOut);
      }),
      new UnitTest('DISPLAY FUNCTION TEST: clearSumArray()', function(app, test) {
        app.context.sumArray = [5, 4, 3, 2, 1];
        app.context.sumIndex = 5;
        var arr = '0,0';
        return (app.clearSumArray() === arr);
      }),
    ];

    var passed = true;
    var failedCount = 0;
    var passedCount = 0;
    for (var i = 0; i < passFail.length; i++) {
      var context = new Context(content, preloaded);
      var app = new App(context);
      app.run();

      var test = passFail[i];
      test.run(app, this);
      if (test.passed) {
        passedCount++;
      } else {
        failedCount++;
        passed = false;
      }
      console.log((test.passed ? 'PASSED: ' : 'FAILED: ') + test.testName + ': ' + ': ' + test.report + ': ' + JSON.stringify(test.result || ''));
      app.clearScreen();
      app.clearScreen();
    }
    console.log('\nTEST RUN ' + (passed ? 'PASSED ' : 'FAILED ') + '(Failed: ' + failedCount + '; Passed: ' + passedCount + ')');

  } else {
    return;
  }
}

function UnitTest(testName, functionToBeTested) {
  return {
    testName: testName,
    functionToBeTested: functionToBeTested,
    report: null,
    result: null,
    passed: false,
    run: function (app) {
      try {
        this.result = this.functionToBeTested(app, this);
        if (this.result === true) {
          this.passed = true;
          return true;
        }
      }
      catch(err) {
        this.report = ' ERROR: ' + err;
        this.passed = false;
      }
    }
  };
}
