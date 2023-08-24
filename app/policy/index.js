const { AbilityBuilder, Ability } = require('@casl/ability')

const policies = {

    guest(user, {can}) {
        can('read', 'Product')
    },

    user(user, {can}) {
        can('update', 'User', {_id: user._id}),
        can('read', 'Product'),
        can('create', 'Product'),
        can('update', 'Product', {_id: user._id}),
        can('delete', 'Product', {_id: user._id})
    },

    admin(user, {can}) {
        can('manage', 'all')
    }

}

function policyFor(user) {

    let builder = new AbilityBuilder()

    if(user && typeof policies[user.role] === 'function') {
        policies[user.role](user, builder)
    
    } else {
        policies['guest'](user, builder)
    }

    return new Ability(builder.rules)

}

module.exports = {
    policyFor
}