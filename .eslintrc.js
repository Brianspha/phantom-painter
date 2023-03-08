module.exports = {
    root: true,
    env: {
      node: true,
    },
    extends: ["plugin:vue/strongly-recommended", "eslint:recommended"],
    rules: {
      "no-console": process.env.NODE_ENV === "production" ? "off" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
      "no-unused-vars": process.env.NODE_ENV === "production" ? "off" : "off",
      "no-async-promise-executor":
        process.env.NODE_ENV === "production" ? "off" : "off",
      "no-empty": process.env.NODE_ENV === "production" ? "off" : "off",
      "no-undef": process.env.NODE_ENV === "production" ? "off" : "off",
    },
    parserOptions: {
      parser: "babel-eslint",
    },
  };