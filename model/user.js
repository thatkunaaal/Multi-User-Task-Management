const {Sequelize,DataTypes,Model} = require('sequelize');
const {sequelize} = require("../config/database")

class User extends Model{};

User.init(
    {
        id : {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name : {
            type: DataTypes.STRING,
            allowNull: false
        },
        email : {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true
            },
            set(value){
                this.setDataValue('email',value.toLowerCase());
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull:false,
            validate: {
                isStrongPass(val){
                    if(!validator.isStrongPassword(val)){
                        throw new Error("Kindly enter a strong password which contain a special character , a number and whose length should be greater than 6");
                    }
                }
            }
        }
    },
    {
        sequelize,
        modelName: 'User',
        timestamps: true,
        underscored: true,
    }
)

module.exports = {User};