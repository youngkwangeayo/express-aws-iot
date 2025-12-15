import axios from "axios";

// 테스트 설정
const config = {
    frId: 10107,
    cookie: null,
    authHeader: null,
    baseURL: 'https://dev-cms.nextpay.co.kr/menu/v1'
};

// GET - 메뉴 리스트 조회
async function getMenuList(frId, cookie, authHeader) {
    console.log(`\n[GET] 메뉴 리스트 조회 (frId: ${frId})`);

    const response = await axios.get(`${config.baseURL}/getMenuList?frId=${frId}`, {
        headers: {
            Authorization: authHeader,
            Cookie: cookie,
        }
    });

    const result = response.data.data.map(item => ({
        menuId: item.menuId,
        menuName: item.menuName
    }));

    console.log(`✓ 조회된 메뉴 개수: ${result.length}`);
    return result;
}

// GET - 메뉴 리스트 조회 (번역 검증용)
async function checkGetMenuList(frId, cookie, authHeader) {
    console.log(`\n[GET] 메뉴 리스트 조회 - 번역 검증 (frId: ${frId})`);

    const response = await axios.get(`${config.baseURL}/getMenuList?frId=${frId}`, {
        headers: {
            Authorization: authHeader,
            Cookie: cookie,
        }
    });

    const result = response.data.data.map(item => ({
        menuId: item.menuId,
        menuName: item.menuName,
        MenuTranslation: item.MenuTranslation
    }));

    console.log(`✓ 조회된 메뉴 개수: ${result.length}`);
    return result;
}

// GET - 카테고리 리스트 조회
async function getCategoryList(frId, cookie, authHeader) {
    console.log(`\n[GET] 카테고리 리스트 조회 (frId: ${frId})`);

    const response = await axios.get(`${config.baseURL}/getCategoryList?frId=${frId}`, {
        headers: {
            Authorization: authHeader,
            Cookie: cookie,
        }
    });

    const result = response.data.data.map(item => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        categoryInfo: item.categoryInfo
    }));

    console.log(`✓ 조회된 카테고리 개수: ${result.length}`);
    return result;
}

// GET - 카테고리 리스트 조회 (번역 검증용)
async function checkGetCategoryList(frId, cookie, authHeader) {
    console.log(`\n[GET] 카테고리 리스트 조회 - 번역 검증 (frId: ${frId})`);

    const response = await axios.get(`${config.baseURL}/getCategoryList?frId=${frId}`, {
        headers: {
            Authorization: authHeader,
            Cookie: cookie,
        }
    });

    const result = response.data.data.map(item => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        categoryInfo: item.categoryInfo,
        CategoryTranslation: item.CategoryTranslation
    }));

    console.log(`✓ 조회된 카테고리 개수: ${result.length}`);
    return result;
}

// GET - 상품 리스트 조회
async function getProductList(frId, cookie, authHeader) {
    console.log(`\n[GET] 상품 리스트 조회 (frId: ${frId})`);

    const response = await axios.get(`${config.baseURL}/getProductList?frId=${frId}`, {
        headers: {
            Authorization: authHeader,
            Cookie: cookie,
        }
    });

    const result = response.data.data.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productInfo: item.productInfo
    }));

    console.log(`✓ 조회된 상품 개수: ${result.length}`);
    return result;
}

// GET - 상품 리스트 조회 (번역 검증용)
async function checkGetProductList(frId, cookie, authHeader) {
    console.log(`\n[GET] 상품 리스트 조회 - 번역 검증 (frId: ${frId})`);

    const response = await axios.get(`${config.baseURL}/getProductList?frId=${frId}`, {
        headers: {
            Authorization: authHeader,
            Cookie: cookie,
        }
    });

    const result = response.data.data.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productInfo: item.productInfo,
        ProductTranslation: item.ProductTranslation
    }));

    console.log(`✓ 조회된 상품 개수: ${result.length}`);
    return result;
}

// POST - 메뉴 번역 저장
async function postMenuTranslationList(frId, body, cookie, authHeader) {
    console.log(`\n[POST] 메뉴 번역 저장`);
    console.log('Body:', JSON.stringify(body, null, 2));

    const bodyWithFrId = body.map(item => ({
        ...item,
        frId: frId
    }));

    const response = await axios.post(`${config.baseURL}/saveMenuTranslationList`, bodyWithFrId, {
        headers: {
            "Authorization": authHeader,
            "Cookie": cookie,
            "Content-Type": "application/json",
        }
    });

    console.log(`✓ 저장 완료:`, response.data);
    return response.data;
}

// POST - 카테고리 번역 저장
async function postCategoryTranslationList(frId, body, cookie, authHeader) {
    console.log(`\n[POST] 카테고리 번역 저장`);
    console.log('Body:', JSON.stringify(body, null, 2));

    const bodyWithFrId = body.map(item => ({
        ...item,
        frId: frId
    }));

    const response = await axios.post(`${config.baseURL}/saveCategoryTranslationList`, bodyWithFrId, {
        headers: {
            "Authorization": authHeader,
            "Cookie": cookie,
            "Content-Type": "application/json",
        }
    });

    console.log(`✓ 저장 완료:`, response.data);
    return response.data;
}

// POST - 상품 번역 저장
async function postProductTranslationList(frId, body, cookie, authHeader) {
    console.log(`\n[POST] 상품 번역 저장`);
    console.log('Body:', JSON.stringify(body, null, 2));

    const bodyWithFrId = body.map(item => ({
        ...item,
        frId: frId
    }));

    const response = await axios.post(`${config.baseURL}/saveProductTranslationList`, bodyWithFrId, {
        headers: {
            "Authorization": authHeader,
            "Cookie": cookie,
            "Content-Type": "application/json",
        }
    });

    console.log(`✓ 저장 완료:`, response.data);
    return response.data;
}

// 메인 테스트 함수
async function runTests() {
    try {
        console.log('=====================================');
        console.log('CMS API 테스트 시작');
        console.log('=====================================');

        const { frId, cookie, authHeader } = config;

        // ===== 메뉴 테스트 =====
        console.log('\n\n[1] 메뉴 테스트');
        console.log('-------------------------------------');

        // 1-1. GET 메뉴 리스트
        let menuList = await getMenuList(frId, cookie, authHeader);
        console.log('처음 2개 메뉴:', menuList.slice(0, 2));

        // 1-2. POST 메뉴 번역 저장 (처음 2개)
        const menuTranslationBody = menuList.slice(0, 2).map((item, index) => ({
            menuId: item.menuId,
            menuName: index === 0 ? 'tmp-test1' : 'tmp-test2',
            locale: 'en'
        }));
        await postMenuTranslationList(frId, menuTranslationBody, cookie, authHeader);

        // 1-3. GET 메뉴 리스트 재조회 (검증)
        menuList = await checkGetMenuList(frId, cookie, authHeader);
        console.log('\n[검증] 저장 후 메뉴 번역 확인:');
        menuList.slice(0, 2).forEach((item, index) => {
            console.log(`메뉴 ${index + 1}:`, {
                menuId: item.menuId,
                menuName: item.menuName,
                MenuTranslation: item.MenuTranslation
            });
        });

        // ===== 카테고리 테스트 =====
        console.log('\n\n[2] 카테고리 테스트');
        console.log('-------------------------------------');

        // 2-1. GET 카테고리 리스트
        let categoryList = await getCategoryList(frId, cookie, authHeader);
        console.log('처음 2개 카테고리:', categoryList.slice(0, 2));

        // 2-2. POST 카테고리 번역 저장 (처음 2개)
        const categoryTranslationBody = categoryList.slice(0, 2).map((item, index) => ({
            categoryId: item.categoryId,
            categoryName: index === 0 ? 'tmp-test1' : 'tmp-test2',
            categoryInfo: index === 0 ? 'tmp-test1' : 'tmp-test2',
            locale: 'en'
        }));
        await postCategoryTranslationList(frId, categoryTranslationBody, cookie, authHeader);

        // 2-3. GET 카테고리 리스트 재조회 (검증)
        categoryList = await checkGetCategoryList(frId, cookie, authHeader);
        console.log('\n[검증] 저장 후 카테고리 번역 확인:');
        categoryList.slice(0, 2).forEach((item, index) => {
            console.log(`카테고리 ${index + 1}:`, {
                categoryId: item.categoryId,
                categoryName: item.categoryName,
                CategoryTranslation: item.CategoryTranslation
            });
        });

        // ===== 상품 테스트 =====
        console.log('\n\n[3] 상품 테스트');
        console.log('-------------------------------------');

        // 3-1. GET 상품 리스트
        let productList = await getProductList(frId, cookie, authHeader);
        console.log('처음 2개 상품:', productList.slice(0, 2));

        // 3-2. POST 상품 번역 저장 (처음 2개)
        const productTranslationBody = productList.slice(0, 2).map((item, index) => ({
            productId: item.productId,
            productName: index === 0 ? 'tmp-test1' : 'tmp-test2',
            productInfo: index === 0 ? 'tmp-test1' : 'tmp-test2',
            locale: 'en'
        }));
        await postProductTranslationList(frId, productTranslationBody, cookie, authHeader);

        // 3-3. GET 상품 리스트 재조회 (검증)
        productList = await checkGetProductList(frId, cookie, authHeader);
        console.log('\n[검증] 저장 후 상품 번역 확인:');
        productList.slice(0, 2).forEach((item, index) => {
            console.log(`상품 ${index + 1}:`, {
                productId: item.productId,
                productName: item.productName,
                ProductTranslation: item.ProductTranslation
            });
        });

        console.log('\n\n=====================================');
        console.log('✓ 모든 테스트 완료');
        console.log('=====================================\n');

    } catch (error) {
        console.error('\n\n[ERROR] 테스트 실패:', error.message);
        if (error.response) {
            console.error('응답 상태:', error.response.status);
            console.error('응답 데이터:', error.response.data);
        }
        process.exit(1);
    }
}

// 테스트 실행
runTests();

// node test/cms-api.test.js > test/output.txt 2>&1