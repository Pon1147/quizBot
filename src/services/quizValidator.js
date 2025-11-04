const config = require("../../config.json");

module.exports = {
  validateCategory: (category) => {
    const validCategories = Object.keys(config.categories);
    if (!validCategories.includes(category)) {
      throw new Error("Category không hợp lệ!");
    }
    return category;
  },

  validateQuizParams: (questions_count = 10, time_per_question = 20) => {
    if (
      questions_count < config.quiz.min_questions ||
      questions_count > config.quiz.max_questions
    ) {
      throw new Error(
        `Số câu phải từ ${config.quiz.min_questions} đến ${config.quiz.max_questions}!`
      );
    }
    if (
      time_per_question < config.quiz.min_time ||
      time_per_question > config.quiz.max_time
    ) {
      throw new Error(
        `Thời gian phải từ ${config.quiz.min_time} đến ${config.quiz.max_time} giây!`
      );
    }
    return { questions_count, time_per_question };
  },
};
