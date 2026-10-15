<?php

namespace App\Exceptions;

use Exception;

/**
 * A known business rule was broken, e.g. "You cannot delete your own account".
 *
 * Throw it from a Service. The controller (or the global handler) turns it into
 * an error response with this message and status code.
 *
 * throw new BusinessException('This role is assigned to 3 users.');        // 422
 * throw new BusinessException('Only a super admin can do this.', 403);     // 403
 */
class BusinessException extends Exception
{
    public function __construct(string $message, public readonly int $status = 422)
    {
        parent::__construct($message);
    }
}
