import {
    getAllOrganizations,
    getOrganizationDetails,
    createOrganization,
    updateOrganization
} from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

const organizationValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Organization name is required')
        .isLength({ min: 3, max: 150 })
        .withMessage('Organization name must be between 3 and 150 characters')
        .escape(),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Organization description is required')
        .isLength({ max: 500 })
        .withMessage('Organization description cannot exceed 500 characters')
        .escape(),
    body('contactEmail')
        .trim()
        .notEmpty()
        .withMessage('Contact email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
];

const showOrganizationsPage = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Partner Organizations';
        res.render('organizations', { title, organizations });
    } catch (error) {
        next(error);
    }
};

const showOrganizationDetailsPage = async (req, res, next) => {
    try {
        const organizationId = req.params.id;
        if (!/^[1-9]\d*$/.test(organizationId)) {
            const error = new Error('Invalid Organization ID');
            error.status = 404;
            return next(error);
        }

        const organization = await getOrganizationDetails(organizationId);
        if (!organization) {
            const error = new Error('Organization Not Found');
            error.status = 404;
            return next(error);
        }

        const projects = await getProjectsByOrganizationId(organizationId);
        const title = organization.name;
        res.render('organization', { title, organization, projects });
    } catch (error) {
        next(error);
    }
};

const showNewOrganizationForm = async (req, res, next) => {
    try {
        const title = 'Add New Organization';
        res.render('new-organization', { title });
    } catch (error) {
        next(error);
    }
};

const processNewOrganizationForm = async (req, res, next) => {
    try {
        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach(error => {
                req.flash('error', error.msg);
            });
            return res.redirect('/new-organization');
        }

        const { name, description, contactEmail } = req.body;
        const logoFilename = 'placeholder-logo.png';

        const organizationId = await createOrganization(
            name,
            description,
            contactEmail,
            logoFilename
        );

        req.flash('success', 'Organization added successfully!');
        res.redirect(`/organization/${organizationId}`);
    } catch (error) {
        next(error);
    }
};

const showEditOrganizationForm = async (req, res, next) => {
    try {
        const organizationId = req.params.id;
        if (!/^[1-9]\d*$/.test(organizationId)) {
            const error = new Error('Invalid Organization ID');
            error.status = 404;
            return next(error);
        }

        const organizationDetails = await getOrganizationDetails(organizationId);
        if (!organizationDetails) {
            const error = new Error('Organization Not Found');
            error.status = 404;
            return next(error);
        }

        const title = 'Edit Organization';
        res.render('edit-organization', { title, organizationDetails });
    } catch (error) {
        next(error);
    }
};

const processEditOrganizationForm = async (req, res, next) => {
    try {
        const organizationId = req.params.id;
        if (!/^[1-9]\d*$/.test(organizationId)) {
            const error = new Error('Invalid Organization ID');
            error.status = 404;
            return next(error);
        }

        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach(error => {
                req.flash('error', error.msg);
            });
            return res.redirect(`/edit-organization/${organizationId}`);
        }

        const { name, description, contactEmail, logoFilename } = req.body;

        await updateOrganization(
            organizationId,
            name,
            description,
            contactEmail,
            logoFilename
        );

        req.flash('success', 'Organization updated successfully!');
        res.redirect(`/organization/${organizationId}`);
    } catch (error) {
        next(error);
    }
};

export {
    showOrganizationsPage,
    showOrganizationDetailsPage,
    showNewOrganizationForm,
    processNewOrganizationForm,
    showEditOrganizationForm,
    processEditOrganizationForm,
    organizationValidation
};
