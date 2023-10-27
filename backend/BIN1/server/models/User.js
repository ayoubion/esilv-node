const { Model, DataTypes } = require("sequelize");
const connection = require("./db");

class User extends Model {}

User.init(
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [8, 32],
            is: /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/,
        },
    },
    role: {
        type: DataTypes.ENUM,
        values: ['admin', 'user'],
        defaultValue: 'user',
    },
    lastname: DataTypes.STRING,
    firstname: DataTypes.STRING,
    dob: DataTypes.DATE,
  },
  {
    sequelize: connection,
  }
);

module.exports = User;
