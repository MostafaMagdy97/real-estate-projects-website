﻿$(window).ready(function () {
    var selectedPostId;
    var currentActiveApplyingButton;
    var url = "/home/Index";

    $("#project-name-s").attr("disabled", true);

    //Deleting a project post
    $(".delete-project-btn").click(function deleteProject() {
        var projectContainer = $(this).parent().parent().parent().parent();
        var projectId = $(projectContainer).attr("id");

        //Deleting from database
        $.post("/home/deleteProject", { id: projectId }, function (operationResults) {
            success = JSON.parse(operationResults);
            if (success.opertaion) {
                $("#" + projectId).remove();
                showSnackbar("Project deleted successfully");
                $("#project-name").val("");
                $("#project-description").val("");
                $("#call-to-action").html("Create Project");
                $("#customer-form").attr("formaction", "create");
            }
                
        });
    });

    //Editing a project post
    $(".edit-project-btn").click(function editProject() {
        var projectContainer = $(this).parent().parent().parent().parent();
        selectedPostId = $(projectContainer).attr("id");
        $("#customer-form").attr("formAction", "edit");
        $("#call-to-action").html("Update Project");
        $("#customer-form").attr("formaction", "edit");

        var projectName = $(projectContainer).find("h4.name")[0].innerHTML;
        var projectDescription = $(projectContainer).find("p.description")[0].innerHTML;

        $("#project-name").val(projectName);
        $("#project-description").val(projectDescription);
        auto_grow(document.getElementById("project-description"));
    });

    //Creating or updating project
    $("#call-to-action").click(function controlProject() {
        var projectName = getInputValue("project-name");
        var projectDescription = getInputValue("project-description");

        //Creating new project
        if ($("#customer-form").attr("formaction") === "create") {
            if (projectName === "" && projectDescription === "") {
                showSnackbar("Couldn't add empty project");
            } else {
                $.post("/home/createProject", {
                    name: projectName,
                    description: projectDescription
                }, function () {
                    $("#project-name").val("");
                    $("#project-description").val("");
                    showSnackbar("Project created successfully");
                    window.location.href = url;
                });
            }
        } //Updating project
        else {
            $.post("/home/updateProject", {
                projectName: projectName,
                projectDescription: projectDescription,
                projectId: selectedPostId
            },
                function () {
                    var projectName = $("#project-name").val();
                    var projectDescription = $("#project-description").val();
                    $("#project-name").val("");
                    $("#project-description").val("");
                    $("#call-to-action").html("Create Project");
                    $("#customer-form").attr("formaction", "create");

                    $("#" + selectedPostId).find("h4.name")[0].innerHTML = projectName;
                    $("#" + selectedPostId).find("p.description")[0].innerHTML = projectDescription;
                    showSnackbar("Project updated successfully");
                });
        }

        $("#project-description").css("height", "48px");
    });

    //Writing comment on posh
    $(".comment-field").keyup(function (event) {
        if (event.keyCode == 13) {
            var projectContainer = $(this).parent().parent().parent();
            var currentProjectId = $(projectContainer).attr("id");
            var newComment = $(this).val();

            if ($(this).val.length !== 0) {
                $.post("/home/writeComment", {
                    projectId: currentProjectId,
                    comment: newComment
                }, function () {
                    window.location.href = url;
                });
            }
        }
    });

    //Apply to project
    $(".apply-to-project-btn").click(function applyToProject() {
        //If he applyied on a project but never sumbited
        $(currentActiveApplyingButton).html("Apply");
        $(currentActiveApplyingButton).attr("disabled", false);
        $("#btn-applyToProject").attr("disabled", false);
        clearFormFields();

        var projectContainer = $(this).parent().parent().parent().parent();
        var projectName = $(projectContainer).find("h4.name")[0].innerHTML;
        selectedPostId = $(projectContainer).attr("id");

        currentActiveApplyingButton = $(projectContainer).find(".apply-to-project-btn")[0];
        $(currentActiveApplyingButton).html("Applying...");
        $(currentActiveApplyingButton).attr("disabled", true);

        $("#project-name-s").val(projectName);
    });

    //Sumbitting applying form
    $("#btn-applyToProject").click(function sumbitForm() {
        //$("#btn-applyToProject").attr("disabled", true);
        var projectId = selectedPostId;
        var price = $("#project-price").val();
        var startingDate = $("#project-start-date").val();
        var endingDate = $("#project-delivery-date").val();
        var letter = $("#project-letter").val();
        if (!checkForEmptyFields("") && checkForDangerFields()) {
            if (checkDate(startingDate, endingDate)) {
                markInputAs("project-delivery-date", DANGER, "The starting date must be before ending date");
            } else {
                $.post("/home/applyToProject", {
                    projectId: projectId,
                    applyingLetter: letter,
                    price: price,
                    startDate: startingDate,
                    endDate: endingDate
                }, function () {
                    showSnackbar("You have applied successfully");
                    $(currentActiveApplyingButton).html("Applied");
                    currentActiveApplyingButton = null;
                    clearFormFields();
                    $("#btn-applyToProject").attr("disabled", false);
                });
            }
            
        }
    });
});

function clearFormFields() {
    $("#project-name-s").val("");
    $("#project-price").val("");
    $("#project-start-date").val("");
    $("#project-delivery-date").val("");
    $("#project-letter").val("");
}