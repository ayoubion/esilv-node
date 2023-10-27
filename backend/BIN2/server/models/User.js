const { Model, DataTypes } = require("sequelize");
const connection = require("./db");

class User extends Model {}

User.init({
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
        isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
        is: /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,32}/
    }
  },
  activated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  dob: DataTypes.DATE,
}, {
    sequelize: connection
});

module.exports = User;