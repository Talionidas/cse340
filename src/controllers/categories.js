import {
    getAllCategories,
    getCategoryDetails,
    getCategoriesByProjectId,
    createCategory,
    updateCategory,
    updateCategoryAssignments
} from '../models/categories.js';
import {
    getProjectsByCategoryId,
    getProjectDetails
} from '../models/projects.js';
import { body, validationResult } from 'express-validator';

const categoryValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Category name is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Category name must be between 3 and 100 characters')
];

const showCategoriesPage = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        const title = 'Service Project Categories';
        res.render('categories', { title, categories });
    } catch (error) {
        next(error);
    }
};

const showCategoryDetailsPage = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        if (!/^[1-9]\d*$/.test(categoryId)) {
            const error = new Error('Invalid Category ID');
            error.status = 404;
            return next(error);
        }

        const category = await getCategoryDetails(categoryId);
        if (!category) {
            const error = new Error('Category Not Found');
            error.status = 404;
            return next(error);
        }

        const projects = await getProjectsByCategoryId(categoryId);
        const title = category.name;
        res.render('category', { title, category, projects });
    } catch (error) {
        next(error);
    }
};

const showNewCategoryForm = async (req, res, next) => {
    try {
        const title = 'Add New Category';
        res.render('new-category', { title });
    } catch (error) {
        next(error);
    }
};

const processNewCategoryForm = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach(error => {
                req.flash('error', error.msg);
            });
            return res.redirect('/new-category');
        }

        const { name } = req.body;
        const categoryId = await createCategory(name);
        req.flash('success', 'Category created successfully!');
        res.redirect(`/category/${categoryId}`);
    } catch (error) {
        next(error);
    }
};

const showEditCategoryForm = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        if (!/^[1-9]\d*$/.test(categoryId)) {
            const error = new Error('Invalid Category ID');
            error.status = 404;
            return next(error);
        }

        const category = await getCategoryDetails(categoryId);
        if (!category) {
            const error = new Error('Category Not Found');
            error.status = 404;
            return next(error);
        }

        const title = 'Edit Category';
        res.render('edit-category', { title, category });
    } catch (error) {
        next(error);
    }
};

const processEditCategoryForm = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        if (!/^[1-9]\d*$/.test(categoryId)) {
            const error = new Error('Invalid Category ID');
            error.status = 404;
            return next(error);
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach(error => {
                req.flash('error', error.msg);
            });
            return res.redirect(`/edit-category/${categoryId}`);
        }

        const { name } = req.body;
        await updateCategory(categoryId, name);
        req.flash('success', 'Category updated successfully!');
        res.redirect(`/category/${categoryId}`);
    } catch (error) {
        next(error);
    }
};

const showAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        if (!/^[1-9]\d*$/.test(projectId)) {
            const error = new Error('Invalid Project ID');
            error.status = 404;
            return next(error);
        }

        const projectDetails = await getProjectDetails(projectId);
        if (!projectDetails) {
            const error = new Error('Project Not Found');
            error.status = 404;
            return next(error);
        }

        const categories = await getAllCategories();
        const assignedCategories = await getCategoriesByProjectId(projectId);
        const title = 'Assign Categories to Project';

        res.render('assign-categories', {
            title,
            projectId,
            projectDetails,
            categories,
            assignedCategories
        });
    } catch (error) {
        next(error);
    }
};

const processAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        if (!/^[1-9]\d*$/.test(projectId)) {
            const error = new Error('Invalid Project ID');
            error.status = 404;
            return next(error);
        }

        const projectDetails = await getProjectDetails(projectId);
        if (!projectDetails) {
            const error = new Error('Project Not Found');
            error.status = 404;
            return next(error);
        }

        const selectedCategoryIds = req.body?.categoryIds || [];
        const categoryIdsArray = Array.isArray(selectedCategoryIds)
            ? selectedCategoryIds
            : [selectedCategoryIds];

        const categories = await getAllCategories();
        const validCategoryIds = new Set(
            categories.map(category => String(category.category_id))
        );

        const hasInvalidCategory = categoryIdsArray.some(
            id => !validCategoryIds.has(String(id))
        );

        if (hasInvalidCategory) {
            req.flash('error', 'One or more selected categories are invalid.');
            return res.redirect(`/assign-categories/${projectId}`);
        }

        await updateCategoryAssignments(projectId, [...new Set(categoryIdsArray)]);
        req.flash('success', 'Categories updated successfully.');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        next(error);
    }
};

export {
    showCategoriesPage,
    showCategoryDetailsPage,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    categoryValidation
};
