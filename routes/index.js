const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

// Generate a new UUID v4 : generate unique identifiers for issues.
const uuid = uuidv4();

// Array for storing project/bug and issue inside project
let projects = [];
let issues = [];

// Rendering Home page
router.get("/", (req, res) => {
  res.render("home", { projects: projects });
});

// Rendering create project page
router.get("/create-project", (req, res) => {
  res.render("createProject");
});

// Post route of create project/Issue page
router.post("/create-project", (req, res) => {
  let project = {
    id: projects.length + 1,
    name: req.body.name,
    description: req.body.description,
    author: req.body.author,
    labels: [],
  };
  projects.push(project);
  res.redirect("/");
});

// Get project/Bug based on Id
router.get("/projects/:id", (req, res) => {
  let projectId = parseInt(req.params.id);
  console.log("Project id is ....", projectId);

  if (isNaN(projectId)) {
    res.status(400).send("Invalid project ID");
    return;
  }

  let project = projects.find((project) => {
    return project.id === projectId;
  });

  if (!project) {
    res.status(404).send("Project not found");
    return;
  }
  let filteredIssues = issues.filter((issue) => {
    if (issue.projectId !== projectId) {
      return false;
    } else if (req.query.labels) {
      let labels = req.query.labels.split(",");
      let hasAllLabels = labels.every((label) => {
        return issue.labels.includes(label.trim());
      });
      if (!hasAllLabels) {
        return false;
      }
    }
    if (req.query.author && issue.author !== req.query.author) {
      return false;
    }
    if (
      req.query.search &&
      !(
        (issue.title &&
          issue.title.toLowerCase().includes(req.query.search.toLowerCase())) ||
        (issue.description &&
          issue.description
            .toLowerCase()
            .includes(req.query.search.toLowerCase()))
      )
    ) {
      return false;
    }
    return true;
  });
  // res.render("projectDetail", { project: project, issues: filteredIssues });
  res.render("projectDetail", {
    locals: { project: project, issues: filteredIssues },
  });
});

// create issue/Bug form
router.get("/projects/:id/create-issue", (req, res) => {
  let projectId = parseInt(req.params.id);
  let project = projects.find((project) => {
    return project.id === projectId;
  });
  res.render("createIssue", { project: project });
});

// Post the Issue/Bug
router.post("/projects/:id/create-issue", (req, res) => {
  let projectId = parseInt(req.params.id);
  let project = projects.find((project) => {
    return project.id === projectId;
  });
  if (!project) {
    res.status(404).send("Project not found");
    return;
  }
  let issue = {
    id: uuidv4(),
    projectId: projectId, // set the projectId property to the current project ID
    title: req.body.title,
    description: req.body.description,
    author: req.body.author,
    labels: req.body.labels.split(",").map((label) => label.trim()),
  };
  issues.push(issue);
  res.redirect(`/projects/${projectId}`);
});

module.exports = router;
