numeral.language('ua', {
  delimiters: {
    thousands: ',',
    decimal: ','
  },
  currency: {
    symbol: '₴'
  }
});

numeral.language('ua');

var game = {
  table: [
    { win_amount:   50, max_range:  3000000, n_wins: 1000000, each:   3, issued_tickets: 3000000 },
    { win_amount:  100, max_range:  6000000, n_wins:  500000, each:   6, issued_tickets: 3000000 },
    { win_amount:  200, max_range:  9000000, n_wins:  250000, each:  12, issued_tickets: 3000000 },
    { win_amount:  500, max_range: 16500000, n_wins:  250000, each:  30, issued_tickets: 7500000 },

    { win_amount: 1000, max_range: 22500000, n_wins:  100000, each:  60, issued_tickets: 6000000 },
    { win_amount: 2000, max_range: 25500000, n_wins:   25000, each: 120, issued_tickets: 3000000 },
    { win_amount: 3000, max_range: 29000000, n_wins:   17500, each: 200, issued_tickets: 3500000 },
    { win_amount: 5000, max_range: 32000000, n_wins:   10000, each: 300, issued_tickets: 3000000 }
  ],

  current_stage:        0,

  total_days:           0,
  total_players:        0,
  total_winners:        0,
  total_income:         0,
  total_payed:          0,
  total_tickets_issued: 0,

  step: function() {
    var day = this._generateNewDay();

    this.updateHTML(day);
    this._applyNewDay(day);
  },

  reset: function() {
    this.current_stage        = 0;
    this.total_days           = 0;
    this.total_players        = 0;
    this.total_winners        = 0;
    this.total_income         = 0;
    this.total_payed          = 0;
    this.total_tickets_issued = 0;
  },

  _currentStage: function() {
    return this.table[this.current_stage]
  },

  _recalculateCurrentStage: function() {
    if (this.total_tickets_issued <= this._currentStage()['max_range']) {
      return this.current_stage
    } else {
      return this.current_stage + 1
    }
  },

  _generateNewDay: function() {
    var new_players        = this._generateMorePlayers(),
        old_players        = this._takeSomeOldPlayers(),
        new_tickets_issued = new_players + old_players,
        new_winners        = Math.floor(new_tickets_issued / this._currentStage()['each']);

    this.current_stage = this._recalculateCurrentStage();

    return {
      new_day:            this.total_days + 1,
      old_players:        old_players,
      new_players:        new_players,
      new_winners:        new_winners,
      new_income:         new_tickets_issued * 20,
      new_payed:          Math.floor(new_winners * this._currentStage()['win_amount']),
      new_tickets_issued: new_tickets_issued
    };
  },

  _applyNewDay: function(day) {
    this.total_days            = day.new_day;
    this.total_players        += day.new_players;
    this.total_winners        += day.new_winners;
    this.total_income         += day.new_income;
    this.total_payed          += day.new_payed;
    this.total_tickets_issued += day.new_tickets_issued;
  },

  updateHTML: function(new_day) {
    var stage_selector = $('#my_table .stage-' + this.current_stage);

    if (!stage_selector.hasClass('success')) {
      stage_selector.addClass('success');
    }

    document.getElementById('total_days').innerHTML           = this.total_days;
    document.getElementById('total_players').innerHTML        = numeral(this.total_players).format('0,0');
    document.getElementById('total_winners').innerHTML        = numeral(this.total_winners).format('0,0');
    document.getElementById('total_tickets_issued').innerHTML = numeral(this.total_tickets_issued).format('0,0');
    document.getElementById('total_income').innerHTML         = numeral(this.total_income).format('0,0$');
    document.getElementById('total_payed').innerHTML          = numeral(this.total_payed).format('0,0$');

    document.getElementById('new_day').innerHTML            = numeral(new_day.new_day).format('+0,0');
    document.getElementById('new_players').innerHTML        = numeral(new_day.new_players).format('+0,0');
    document.getElementById('new_winners').innerHTML        = numeral(new_day.new_winners).format('+0,0');
    document.getElementById('new_tickets_issued').innerHTML = numeral(new_day.new_tickets_issued).format('+0,0');
    document.getElementById('new_income').innerHTML         = numeral(new_day.new_income).format('+0,0$');
    document.getElementById('new_payed').innerHTML          = numeral(new_day.new_payed).format('+0,0$');

    var income_formula = '(' + numeral(new_day.new_players).format('0,0')
                             + ' + '
                             + numeral(new_day.old_players).format('0,0')
                             + ') × '
                             + numeral(20).format('0,0$');

    var tickets_issued_folmula = numeral(new_day.new_players).format('0,0')
                                 + ' + '
                                 + numeral(new_day.old_players).format('0,0');

    var payed_formula          = numeral(new_day.new_winners).format('0,0')
                                 + ' × '
                                 + numeral(this._currentStage()['win_amount']).format('0,0$');

    document.getElementById('new_tickets_issued_formula').innerHTML = ' = ' + tickets_issued_folmula;
    document.getElementById('new_income_formula').innerHTML         = ' = ' + income_formula;
    document.getElementById('new_payed_formula').innerHTML          = ' = ' + payed_formula;
  },

  _generateMorePlayers: function() {
    return Math.floor((Math.random() * 5000) + 1);
  },

  _takeSomeOldPlayers: function() {
    return Math.floor(0.1 * this.total_players);
  }
};

$(function() {
  var html_table = document.getElementById('my_table');

  for (var i = 0; i < game.table.length; i++) {
    var new_row         = html_table.insertRow(i + 1);
    var row_object      = game.table[i];
    var row_object_keys = Object.keys(row_object);

    new_row.className = 'my_row text-right' + ' stage-' + i;

    new_row.insertCell(0).innerHTML = row_object[ 'win_amount' ];
    new_row.insertCell(1).innerHTML = row_object[ 'max_range' ];
    new_row.insertCell(2).innerHTML = row_object[ 'n_wins' ];
    new_row.insertCell(3).innerHTML = row_object[ 'each' ];
    new_row.insertCell(4).innerHTML = row_object[ 'issued_tickets' ];
  }

  $('#step').on('click', function() {
    game.step();
  });

  $('#reset').on('click', function() {
    game.reset();

    game.updateHTML({
      new_day:            0,
      new_players:        0,
      new_winners:        0,
      new_income:         0,
      new_payed:          0,
      new_tickets_issued: 0
    });

    $('#my_table tr.success').removeClass('success');
  });

  $('#pause').on('click', function() {
    clearInterval(window.experimentId);
  });

  $('#start').on('click', function() {
    window.experimentId = setInterval(function() {
      game.step()
    }, 50)
  })
});
