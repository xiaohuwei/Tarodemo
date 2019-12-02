import * as indexApi from './service';

export default {
  namespace: 'index',
  state: {
      keai:'测试数据666'
  },

  effects: {
    * effectsDemo(_, { call, put }) {
      const { status, data } = yield call(indexApi.demo, {});
      if (status === 'ok') {
        yield put({ type: 'save',
          payload: {
            topData: data,
          } });
      }
    },
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },

};
