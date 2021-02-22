import * as types from '../../common/mutationTypes'

const socialProStateChange = ({ commit }, payload) => {
    commit(types.SET_ITEM, {
        key: payload.key,
        value: payload.value
    })
}

export default {
    socialProStateChange
}