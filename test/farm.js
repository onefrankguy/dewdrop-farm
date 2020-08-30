const Farm = require('../src/farm');

test('Farm#create creates a new farm', () => {
  const farm = Farm.create();

  expect(farm.rows).toEqual(6);
  expect(farm.cols).toEqual(6);
  expect(farm.inventory).toEqual([undefined, undefined, undefined, undefined]);
  expect(farm.market).toEqual({});
});

const testDispatch = (tool, type, queue) => {
  test(`Farm#dispatch ${tool} updates land`, () => {
    const action = {
      tool,
      row: 0,
      col: 0,
    };

    const farm = Farm.dispatch(Farm.create({time: 2}), action);

    expect(farm.land[0][0][type].time).toEqual(2);
  });

  test(`Farm#dispatch ${tool} updates time`, () => {
    const action = {
      tool,
      row: 0,
      col: 0,
      time: 1,
    };

    const farm = Farm.dispatch(Farm.create({time: 2}), action);

    expect(farm.land[0][0][type].time).toEqual(1);
  });

  if (queue) {
    test(`Farm#dispatch ${tool} queues actions`, () => {
      const action = {
        tool,
        row: 0,
        col: 0,
      };

      const farm = Farm.dispatch(Farm.create({time: 2}), action);

      expect(farm.actions).toEqual(queue);
    });
  }
};

testDispatch('hoe', 'till', [{
  tool: 'poke',
  row: 0,
  col: 0,
}]);

testDispatch('water', 'water', [{
  tool: 'poke',
  row: 0,
  col: 0,
}]);

test('Farm#dispatch update dispatches queued actions', () => {
  const action = {
    tool: 'update',
    row: 0,
    col: 0,
  };

  let farm = Farm.create({
    actions: [{
      tool: 'hoe',
      row: 0,
      col: 0,
    }, {
      tool: 'hoe',
      row: 1,
      col: 1,
    }, {
      tool: 'update',
      row: 0,
      col: 0,
    }],
  });

  farm = Farm.dispatch(farm, action);

  expect(farm.actions).toEqual([{
    tool: 'poke',
    row: 0,
    col: 0,
  }, {
    tool: 'poke',
    row: 1,
    col: 1,
  }, {
    tool: 'bunny',
    row: 0,
    col: 0,
  }, {
    tool: 'hop',
    row: 0,
    col: 0,
  }]);
});

test('Farm#dispatch poke scares the bunny', () => {
  const action = {
    tool: 'poke',
    row: 1,
    col: 2,
  };

  const bunny = {
    type: 'bunny',
    time: 0,
  };

  let farm = Farm.create();
  farm.land[1][2] = {bunny};
  farm.bunny = 0;

  farm = Farm.dispatch(farm, action);

  expect(farm.bunny).toEqual(0);
  expect(farm.land[1][2]).toEqual({bunny});
  expect(farm.land[0][2]).toEqual({});
  expect(farm.actions).toEqual([{
    tool: 'move',
    row: 0,
    col: 2,
  }]);
});

test('Farm#dispatch poke scares the bunny away', () => {
  const action = {
    tool: 'poke',
    row: 0,
    col: 2,
  };

  const bunny = {
    type: 'bunny',
    time: 0,
  };

  let farm = Farm.create();
  farm.land[0][2] = {bunny};
  farm.bunny = 0;

  farm = Farm.dispatch(farm, action);

  expect(farm.bunny).toBeGreaterThan(0);
  expect(farm.land[0][2]).toEqual({});
  expect(farm.actions).toEqual([]);
});

test('Farm#dispatch move destroys crops', () => {
  const action = {
    tool: 'move',
    row: 0,
    col: 0,
  };

  const plant = {
    crop: 'corn',
  };

  const bunny = {
    time: 0,
  };

  let farm = Farm.create();
  farm.land[0][0] = {plant};
  farm.land[1][1] = {bunny};

  farm = Farm.dispatch(farm, action);

  expect(farm.land[0][0]).toEqual({bunny});
  expect(farm.land[1][1]).toEqual({});
  expect(farm.actions).toEqual([]);
});

test('Farm#dispatch move keeps sprinklers', () => {
  const action = {
    tool: 'move',
    row: 0,
    col: 0,
  };

  const plant = {
    crop: 'sprinkler',
  };

  const bunny = {
    time: 0,
  };

  let farm = Farm.create();
  farm.land[0][0] = {plant}
  farm.land[1][1] = {bunny};

  farm = Farm.dispatch(farm, action);

  expect(farm.land[0][0]).toEqual({plant, bunny});
  expect(farm.land[1][1]).toEqual({});
  expect(farm.actions).toEqual([]);
});
