const { body, param } = require("express-validator");
const { validateResultHandler, validateFrId } = require(".");
const { validateProductOption } = require("./optionItemValidation");


const validateOptionGroup = [
    body("productId")
        .exists({ checkFalsy: true }).withMessage("productId is required")
        .isInt().withMessage("productId must be an integer")
        .toInt(),

    body("multiSelect")
        .default("Y")
        .isIn(["Y", "N"]).withMessage("multiSelect must be 'Y' or 'N'"),

    body("selectNum")
        .default(0)
        .isInt({ min: 0 }).withMessage("selectNum must be an integer >= 0")
        .toInt(),

    body("listSeq")
        .optional()
        .isInt().withMessage("listSeq must be an integer")
        .toInt(),

    body("title")
        .optional()
        .isString().withMessage("title must be a string"),

    body("titleEn")
        .optional()
        .isString().withMessage("titleEn must be a string"),

    body("titleJa")
        .optional()
        .isString().withMessage("titleJa must be a string"),

    body("titleZh")
        .optional()
        .isString().withMessage("titleZh must be a string"),

    validateResultHandler
];

const validateCreateOptionGroup = [
    validateFrId,
    validateOptionGroup,
    body("ProductOption")
        .isArray().withMessage("productOption must be an array")
        .custom((value) => { if (value.length < 1) throw new Error("옵션은 최소 1개 이상 포함되어야 합니다."); return true; }),

    // ProductOption 배열 안 각 항목의 필드 검사 최소 1개이상 선택하게하기.
    body("ProductOption.*.menuCategoryId")
        .exists({ checkFalsy: true }).withMessage("menuCategoryId is required")
        .isInt().withMessage("menuCategoryId must be an integer").toInt(),

    body("ProductOption.*.optionId")
        .exists({ checkFalsy: true }).withMessage("optionId is required")
        .isInt().withMessage("optionId must be an integer").toInt(),

    body("ProductOption.*.dcYn")
        .optional().isIn(["Y", "N"]).withMessage("dcYn must be 'Y' or 'N'"),

    body("ProductOption.*.dcAmount")
        .optional()
        .isFloat().withMessage("dcAmount must be a number"),

    body("ProductOption.*.listSeq")
        .optional()
        .isInt().withMessage("listSeq must be an integer"),


    validateResultHandler
];



const validateOptionGroupDetail = [
    param("groupId").isInt().toInt().withMessage("검색할 옵션그룹 id를 입력하세요."),
    validateFrId,
    validateResultHandler
];


const validateIncludedOptionGroup = [
    param("productId").isInt().toInt().withMessage("검색할 상품 id를 입력하세요."),
    validateFrId,
    validateResultHandler
]


const validateCopyOptionGroup = [
    param("productId").isInt().toInt().withMessage("검색할 상품 id를 입력하세요."),
    body("ProductOptionGroup")
        .isArray().withMessage("ProductOptionGroup must be an array")
        .custom((value) => { if (value.length < 1) throw new Error("옵션그룹은 array 입니다."); return true; }),

    body("ProductOptionGroup.*.productId")
        .notEmpty().withMessage("productId is required")
        .isInt().withMessage("productId must be an integer")
        .toInt(),
    body("ProductOptionGroup.*.optionGroupId")
        .notEmpty().withMessage("productId is required")
        .isInt().withMessage("productId must be an integer")
        .toInt(),
    body("ProductOptionGroup.*.multiSelect")
        .optional()
        .isIn(["Y", "N"]).withMessage("multiSelect must be 'Y' or 'N'"),
    body("ProductOptionGroup.*.selectNum")
        .optional()
        .isInt({ min: 0 }).withMessage("selectNum must be an integer >= 0")
        .toInt(),
    body("ProductOptionGroup.*.listSeq")
        .optional()
        .isInt().withMessage("listSeq must be an integer")
        .toInt(),
    body("ProductOptionGroup.*.title")
        .optional()
        .isString().withMessage("title must be a string"),
    validateFrId,
    validateResultHandler
]

module.exports = { validateOptionGroup, validateCreateOptionGroup, validateOptionGroupDetail, validateIncludedOptionGroup, validateCopyOptionGroup };
