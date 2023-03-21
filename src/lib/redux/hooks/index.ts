/* eslint-disable no-restricted-syntax */
/* eslint-disable no-return-assign */
/* eslint-disable arrow-parens */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState } from '..';
import { generalSlice } from '../config';
import { GeneralState } from '../state/initial';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const s_useReducers_np = (reducerKeys: (keyof GeneralState)[]): GeneralState => {
  const _reducers = {} as any;
  reducerKeys.forEach((key) => _reducers[key] = useSelector<RootState>((state) => state[key]));

  return _reducers as GeneralState;
};

const s_useReducers_wp = (reducerKeys: string[]): GeneralState => {
  const _reducers = {} as any;
  reducerKeys.forEach((key) => {
    const lastfieldNameRegex = /[^.]+$/;
    const match = key.match(lastfieldNameRegex);
    const index = match ? match[0] : key;

    _reducers[index] = useSelector<RootState>((state) => {
      const parts = key.split('.') as [];
      let object = state;

      for (const part of parts) {
        object = object[part];
      }

      return object;
    }) as any;
  });

  return _reducers;
};

type ReducerSelect = string | { [key: string]: ReducerSelect | ReducerSelect[] };

export const useReducers = (...reducerSelect: ReducerSelect[]): any => {
  const _reducerSelect = reducerSelect;

  const stringWithPointRegex = /\w+\.\w+/;
  const s_reducerSelects_np = _reducerSelect
    .filter((rs) => typeof rs === 'string' && !stringWithPointRegex.test(rs));
  const s_reducerSelects_wp = _reducerSelect
    .filter((rs) => typeof rs === 'string' && stringWithPointRegex.test(rs));
  // const o_reducerSelects = _reducerSelect
  //   .filter((rs) => typeof rs === 'object');

  const s_reducersResult_np = s_useReducers_np(s_reducerSelects_np as (keyof GeneralState)[]);
  const s_reducersResult_wp = s_useReducers_wp(s_reducerSelects_wp as (keyof GeneralState)[]);

  return { ...s_reducersResult_np, ...s_reducersResult_wp };
};

type RecursivePartial<T> = {
  [P in keyof T]?:
  T[P] extends (infer U)[] ? RecursivePartial<U>[] :
    T[P] extends object ? RecursivePartial<T[P]> :
      T[P];
};

export function useApply() {
  const { _apply } = generalSlice.actions;
  const dispatch = useDispatch();
  function handle<T=any>(key: keyof GeneralState, value?: RecursivePartial<T>) {
    return dispatch(_apply({ key, value }));
  }
  return handle;
}
export default generalSlice.reducer;
