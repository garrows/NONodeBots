/* modules */
exports = module.exports = {};

/* models */
exports.models = {
    robot: require('./models/robot.model')
};

/* services */
exports.services = {
    base: {
        name: 'baseService',
        service: require('./services/base.service')
    },
    setup: {
        name: 'setupService',
        service: require('./services/setup.service')
    },
    robot: {
        name: 'robotService',
        service: require('./services/robot.service')
    }
};