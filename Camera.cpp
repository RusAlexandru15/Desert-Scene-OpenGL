#include "Camera.hpp"
#include "glm/glm.hpp"//core glm functionality
#include "glm/gtc/matrix_transform.hpp"//glm extension for generating common transformation matrices
#include "glm/gtc/type_ptr.hpp"//glm extension for accessing the internal data structure of glm types

namespace gps {

    //Camera constructor
    Camera::Camera(glm::vec3 cameraPosition1, glm::vec3 cameraTarget1, glm::vec3 cameraUp) {
        //TODO
        cameraPosition = cameraPosition1;
        cameraUpDirection = cameraUp;
        cameraFrontDirection = cameraTarget1 - cameraPosition1;
        cameraTarget = cameraTarget1;

         
    }

    
    glm::mat4 Camera::getViewMatrix() {
        //TODO
        return glm::lookAt(cameraPosition, cameraTarget, cameraUpDirection);
      
    }

   
    void Camera::move(MOVE_DIRECTION direction, float speed) {
        //TODO
      
        if (direction == MOVE_FORWARD){
            cameraPosition += speed * cameraFrontDirection;
            cameraTarget+= speed * cameraFrontDirection;

            cameraFrontDirection = cameraTarget - cameraPosition;
        }
            

        if (direction == MOVE_BACKWARD) {
            cameraPosition -= speed * cameraFrontDirection;
            cameraTarget -= speed * cameraFrontDirection;

            cameraFrontDirection = cameraTarget - cameraPosition;
        }
        
        if (direction == MOVE_LEFT) {
            cameraPosition -= glm::normalize(glm::cross(cameraFrontDirection, cameraUpDirection)) * speed;
            cameraTarget -= glm::normalize(glm::cross(cameraFrontDirection, cameraUpDirection)) * speed;

            cameraFrontDirection = cameraTarget - cameraPosition;
        }
            

        if (direction == MOVE_RIGHT) {
            cameraPosition += glm::normalize(glm::cross(cameraFrontDirection, cameraUpDirection)) * speed;
            cameraTarget += glm::normalize(glm::cross(cameraFrontDirection, cameraUpDirection)) * speed;

            cameraFrontDirection = cameraTarget - cameraPosition;

        }
           

    }

   
    void Camera::rotate(float pitch, float yaw) {
        //TODO
        glm::vec3 direction;
        direction.x = cos(glm::radians(yaw)) * cos(glm::radians(pitch));
        direction.y = sin(glm::radians(pitch));
        direction.z = sin(glm::radians(yaw)) * cos(glm::radians(pitch));
        cameraTarget = cameraPosition+glm::normalize(direction);

        cameraFrontDirection = cameraTarget - cameraPosition;
        cameraRightDirection = glm::cross(cameraFrontDirection, glm::vec3(0.0f, 1.0f,0.0f));
        cameraUpDirection = glm::cross(cameraRightDirection,cameraFrontDirection);

    }

    void Camera::autoMove(glm::vec3 position, glm::vec3 target) {
        cameraPosition = position;
        cameraTarget = target;
        cameraFrontDirection = cameraTarget-cameraPosition;
    }

    glm::vec3 Camera::getCameraDirection()
    {
        return cameraFrontDirection;
    }

    glm::vec3 Camera::getCameraPosition()
    {
        return cameraPosition;
    }

    glm::vec3 Camera::getCameraTarget()
    {
        return cameraTarget;
    }
 
}