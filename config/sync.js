const {sequelize} = require("../config/database")

const synchronizeDB = async () => {
    try{
        await sequelize.sync();
        console.log('All models were synchronized successfully.');
    }
    catch(err){
        throw new Error(err);
    }
}

module.exports = {synchronizeDB};